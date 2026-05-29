<template>
  <div class="h-full w-full">
    <VueFlow
      :nodes="flowNodes"
      :edges="flowEdges"
      :node-types="nodeTypes"
      :default-viewport="{ x: 0, y: 0, zoom: 0.5 }"
      fit-view-on-init
      :min-zoom="0.1"
      :max-zoom="2"
      @node-click="onNodeClick"
    >
      <Background :gap="20" :size="1" pattern-color="#e5e7eb" />
      <Controls show-zoom show-fit-view class="!bottom-4 !right-4" />
    </VueFlow>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import PersonNode from './PersonNode.vue'

const props = defineProps({
  people: { type: Array, default: () => [] },
  families: { type: Array, default: () => [] },
  focusId: { type: String, default: null },
})

const router = useRouter()

const nodeTypes = { person: PersonNode }

const peopleMap = computed(() => {
  const map = {}
  for (const p of props.people) map[p.id] = p
  return map
})

const flowNodes = computed(() => {
  if (!props.people.length) return []
  const pm = peopleMap.value

  const NODE_W = 110
  const NODE_H = 52
  const RANK_SEP = 80
  const COUPLE_GAP = 8
  const FAMILY_GAP = 35
  const MARGIN_X = 40
  const MARGIN_Y = 30

  // 1. Build parent->children lookup
  const familiesOf = {}
  const childToFamily = {}
  for (const f of props.families) {
    const entry = { spouseId: null, childIds: f.childIds || [], familyId: f.id }
    if (f.husbandId) {
      if (!familiesOf[f.husbandId]) familiesOf[f.husbandId] = []
      familiesOf[f.husbandId].push({ ...entry, spouseId: f.wifeId || null })
    }
    if (f.wifeId) {
      if (!familiesOf[f.wifeId]) familiesOf[f.wifeId] = []
      if (!familiesOf[f.wifeId].some(e => e.familyId === f.id)) {
        familiesOf[f.wifeId].push({ ...entry, spouseId: f.husbandId || null })
      }
    }
    for (const cid of f.childIds || []) {
      childToFamily[cid] = { husbandId: f.husbandId, wifeId: f.wifeId, familyId: f.id }
    }
  }

  // 2. BFS generations from root
  const root = props.people.find(p => p.isRoot) || props.people[0]
  const gen = { [root.id]: 0 }
  const bfsQueue = [root.id]
  while (bfsQueue.length) {
    const id = bfsQueue.shift()
    const g = gen[id]
    for (const e of (familiesOf[id] || [])) {
      if (e.spouseId && gen[e.spouseId] === undefined) {
        gen[e.spouseId] = g
        bfsQueue.push(e.spouseId)
      }
      for (const cid of e.childIds) {
        if (gen[cid] === undefined) {
          gen[cid] = g + 1
          bfsQueue.push(cid)
        }
      }
    }
  }

  // Assign gen 0 to any person still missing one
  for (const p of props.people) {
    if (gen[p.id] === undefined) gen[p.id] = 0
  }

  // 3. Calculate subtree widths (post-order recursive)
  const subW = {}

  function calcWidth(id) {
    const entries = familiesOf[id] || []
    const g = gen[id]

    // Find spouse at same generation
    let spouseInGen = null
    for (const e of entries) {
      if (e.spouseId && gen[e.spouseId] === g) {
        spouseInGen = e.spouseId
        break
      }
    }
    const coupleW = spouseInGen ? NODE_W * 2 + COUPLE_GAP : NODE_W

    // Gather all children, sorted by birth year
    const allKids = []
    for (const e of entries) {
      for (const cid of e.childIds) {
        if (!allKids.includes(cid)) allKids.push(cid)
      }
    }
    allKids.sort((a, b) => (pm[a]?.birthYear ?? 9999) - (pm[b]?.birthYear ?? 9999))

    for (const cid of allKids) calcWidth(cid)
    const kidsW = allKids.reduce((s, cid) => s + (subW[cid] ?? 0) + FAMILY_GAP, 0) - (allKids.length > 0 ? FAMILY_GAP : 0)

    subW[id] = Math.max(coupleW, kidsW, 0)
  }

  calcWidth(root.id)

  // 4. Assign positions
  const pos = {}

  function assignPos(id, offsetX) {
    const g = gen[id]
    const y = MARGIN_Y + g * (NODE_H + RANK_SEP)
    const entries = familiesOf[id] || []

    let spouseInGen = null
    for (const e of entries) {
      if (e.spouseId && gen[e.spouseId] === g) {
        spouseInGen = e.spouseId
        break
      }
    }
    const coupleW = spouseInGen ? NODE_W * 2 + COUPLE_GAP : NODE_W
    const sw = subW[id] || coupleW

    // Center the couple horizontally within the subtree
    const cx = offsetX + (sw - coupleW) / 2

    pos[id] = { x: cx + NODE_W / 2, y: y + NODE_H / 2 }
    if (spouseInGen) {
      pos[spouseInGen] = { x: cx + NODE_W + COUPLE_GAP + NODE_W / 2, y: y + NODE_H / 2 }
    }

    // Gather and sort children
    const allKids = []
    for (const e of entries) {
      for (const cid of e.childIds) {
        if (!allKids.includes(cid)) allKids.push(cid)
      }
    }
    allKids.sort((a, b) => (pm[a]?.birthYear ?? 9999) - (pm[b]?.birthYear ?? 9999))

    let childX = offsetX
    for (const cid of allKids) {
      assignPos(cid, childX)
      childX += (subW[cid] ?? 0) + FAMILY_GAP
    }
  }

  assignPos(root.id, MARGIN_X)

  // Ensure every person has a position
  for (const p of props.people) {
    if (!pos[p.id]) {
      const g = gen[p.id] ?? 0
      pos[p.id] = { x: MARGIN_X + NODE_W / 2, y: MARGIN_Y + g * (NODE_H + RANK_SEP) + NODE_H / 2 }
    }
  }

  // 5. Create vue-flow nodes
  return props.people.map(p => {
    const ppos = pos[p.id]
    return {
      id: p.id,
      type: 'person',
      position: { x: ppos.x - NODE_W / 2, y: ppos.y - NODE_H / 2 },
      data: { person: p },
    }
  })
})

const flowEdges = computed(() => {
  const edges = []
  const edgeSet = new Set()
  
  for (const f of props.families) {
    // 1. FIX SPOUSES: Connect Right side to Left side in a straight line
    if (f.husbandId && f.wifeId) {
      const key = `spouse-${f.husbandId}-${f.wifeId}`
      if (!edgeSet.has(key)) {
        edges.push({
          id: key,
          source: f.husbandId,
          target: f.wifeId,
          sourceHandle: 'right', // Explicitly exit right side
          targetHandle: 'left',  // Explicitly enter left side
          type: 'straight',      // Direct horizontal line
          style: 'stroke: #cbd5e1; stroke-width: 2; stroke-dasharray: 6,3;',
          animated: false,
          zIndex: 0,
        })
        edgeSet.add(key)
      }
    }
    
    // 2. FIX CHILDREN: Connect Bottom side of parent to Top side of child
    for (const childId of f.childIds || []) {
      if (f.husbandId) {
        const key = `parent-${f.husbandId}-${childId}`
        if (!edgeSet.has(key)) {
          edges.push({
            id: key,
            source: f.husbandId,
            target: childId,
            sourceHandle: 'bottom', // Explicitly exit bottom side
            targetHandle: 'top',    // Explicitly enter top side
            type: 'smoothstep',     // Keep the clean 90-degree look
            style: 'stroke: #94a3b8; stroke-width: 2;',
            zIndex: 1,
          })
          edgeSet.add(key)
        }
      }
      if (f.wifeId) {
        const key = `parent-${f.wifeId}-${childId}`
        if (!edgeSet.has(key)) {
          edges.push({
            id: key,
            source: f.wifeId,
            target: childId,
            sourceHandle: 'bottom', // Explicitly exit bottom side
            targetHandle: 'top',    // Explicitly enter top side
            type: 'smoothstep',     // Keep the clean 90-degree look
            style: 'stroke: #94a3b8; stroke-width: 2;',
            zIndex: 1,
          })
          edgeSet.add(key)
        }
      }
    }
  }
  return edges
})

function onNodeClick({ node }) {
  const person = node.data.person
  if (person) {
    router.push(`/person/${person.id}`)
  }
}
</script>
