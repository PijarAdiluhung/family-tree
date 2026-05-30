<template>
  <div class="h-full w-full">
    <VueFlow
      ref="vueFlowRef"
      :nodes="flowNodes"
      :edges="flowEdges"
      :node-types="nodeTypes"
      :nodes-draggable="false"
      :nodes-focusable="false"
      :edges-focusable="false"
      :default-edge-options="{ interactionWidth: 0 }"
      :pan-on-drag="true"
      :min-zoom="0.1"
      :max-zoom="2"
      @node-click="onNodeClick"
      @pane-ready="onPaneReady"
      @pane-click="onPaneClick"
    >
      <Background :gap="20" :size="1" pattern-color="#e5e7eb" />
      <Controls show-zoom show-fit-view class="!bottom-4 !right-4" />
      <MiniMap
        class="!bottom-3 !right-3 !shadow-lg max-h-[120px]"
        node-color="#059669"
        mask-color="rgba(5, 150, 105, 0.1)"
        :node-border-radius="4"
        :style="{ width: 180, height: 80 }"
      />
    </VueFlow>
  </div>
</template>

<script setup>
import { computed, ref, nextTick, watch, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import PersonNode from './PersonNode.vue'

const props = defineProps({
  people: { type: Array, default: () => [] },
  families: { type: Array, default: () => [] },
  focusId: { type: String, default: null },
  highlightPersonId: { type: String, default: null },
})

const emit = defineEmits(['highlightCleared'])

const router = useRouter()

const vueFlowRef = ref(null)
const nodeTypes = { person: markRaw(PersonNode) }

function onPaneReady() {
  nextTick(() => {
    const flow = vueFlowRef.value
    if (!flow || !flowNodes.value.length) return

    const NODE_W = 110
    const NODE_H = 52

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
    for (const node of flowNodes.value) {
      minX = Math.min(minX, node.position.x)
      maxX = Math.max(maxX, node.position.x + NODE_W)
      minY = Math.min(minY, node.position.y)
      maxY = Math.max(maxY, node.position.y + NODE_H)
    }

    const vh = window.innerHeight
    const zoom = Math.min((vh * 0.8) / (maxY - minY), 1.5)
    const y = (vh - (maxY - minY) * zoom) / 2

    const root = props.people.find(p => p.isRoot) || props.people[0]
    const rootNode = root && flowNodes.value.find(n => n.id === root.id)
    const vw = window.innerWidth
    const x = rootNode
      ? (vw / 2) - (rootNode.position.x + NODE_W / 2) * zoom
      : (vw - (maxX - minX) * zoom) / 2

    flow.setViewport({ x, y, zoom }, { duration: 0 })
  })
}

function onPaneClick() {
  if (props.highlightPersonId) {
    emit('highlightCleared')
  }
}

const peopleMap = computed(() => {
  const map = {}
  for (const p of props.people) map[p.id] = p
  return map
})

const highlightedPath = computed(() => {
  const pid = props.highlightPersonId
  if (!pid) return []

  const root = props.people.find(p => p.isRoot) || props.people[0]
  if (!root) return []

  const parentMap = {}
  for (const f of props.families) {
    for (const cid of (f.childIds || [])) {
      if (!parentMap[cid]) parentMap[cid] = []
      if (f.husbandId) parentMap[cid].push(f.husbandId)
      if (f.wifeId) parentMap[cid].push(f.wifeId)
    }
  }

  const path = [pid]
  let current = pid
  const visited = new Set([pid])
  while (current && current !== root.id) {
    const parents = parentMap[current]
    if (!parents || parents.length === 0) break
    const next = parents[0]
    if (visited.has(next)) break
    visited.add(next)
    current = next
    path.unshift(current)
    if (current === root.id) break
  }

  return path
})

const highlightedNodeSet = computed(() => new Set(highlightedPath.value))

const highlightedEdgeSet = computed(() => {
  const path = highlightedPath.value
  const set = new Set()
  for (let i = 0; i < path.length - 1; i++) {
    const parent = path[i]
    const child = path[i + 1]
    set.add(`parent-${parent}-${child}`)
  }
  return set
})

watch(() => props.highlightPersonId, (id) => {
  if (!id) return
  nextTick(() => {
    const flow = vueFlowRef.value
    if (!flow) return
    flow.fitView({ nodes: [id], duration: 300, padding: 0.3 })
  })
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

  for (const p of props.people) {
    if (gen[p.id] === undefined) gen[p.id] = 0
  }

  const subW = {}

  function calcWidth(id) {
    const entries = familiesOf[id] || []
    const g = gen[id]

    let spouseInGen = null
    for (const e of entries) {
      if (e.spouseId && gen[e.spouseId] === g) {
        spouseInGen = e.spouseId
        break
      }
    }
    const coupleW = spouseInGen ? NODE_W * 2 + COUPLE_GAP : NODE_W

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

    const cx = offsetX + (sw - coupleW) / 2

    pos[id] = { x: cx + NODE_W / 2, y: y + NODE_H / 2 }
    if (spouseInGen) {
      pos[spouseInGen] = { x: cx + NODE_W + COUPLE_GAP + NODE_W / 2, y: y + NODE_H / 2 }
    }

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

  for (const p of props.people) {
    if (!pos[p.id]) {
      const g = gen[p.id] ?? 0
      pos[p.id] = { x: MARGIN_X + NODE_W / 2, y: MARGIN_Y + g * (NODE_H + RANK_SEP) + NODE_H / 2 }
    }
  }

  return props.people.map(p => {
    const ppos = pos[p.id]
    return {
      id: p.id,
      type: 'person',
      position: { x: ppos.x - NODE_W / 2, y: ppos.y - NODE_H / 2 },
      data: {
        person: p,
        highlighted: highlightedNodeSet.value.has(p.id),
      },
    }
  })
})

const flowEdges = computed(() => {
  const edges = []
  const edgeSet = new Set()
  const pm = peopleMap.value

  for (const f of props.families) {
    if (f.husbandId && f.wifeId && pm[f.husbandId] && pm[f.wifeId]) {
      const key = `spouse-${f.husbandId}-${f.wifeId}`
      if (!edgeSet.has(key)) {
        edges.push({
          id: key,
          source: f.husbandId,
          target: f.wifeId,
          sourceHandle: 'right',
          targetHandle: 'left',
          type: 'straight',
          style: highlightedEdgeSet.value.has(key)
            ? 'stroke: #059669; stroke-width: 3; stroke-dasharray: 6,3;'
            : 'stroke: #cbd5e1; stroke-width: 2; stroke-dasharray: 6,3;',
          animated: false,
          zIndex: highlightedEdgeSet.value.has(key) ? 2 : 0,
        })
        edgeSet.add(key)
      }
    }

    for (const childId of f.childIds || []) {
      if (!pm[childId]) continue
      if (f.husbandId && pm[f.husbandId]) {
        const key = `parent-${f.husbandId}-${childId}`
        if (!edgeSet.has(key)) {
          edges.push({
            id: key,
            source: f.husbandId,
            target: childId,
            sourceHandle: 'bottom',
            targetHandle: 'top',
            type: 'smoothstep',
            style: highlightedEdgeSet.value.has(key)
              ? 'stroke: #059669; stroke-width: 3;'
              : 'stroke: #94a3b8; stroke-width: 2;',
            zIndex: highlightedEdgeSet.value.has(key) ? 2 : 1,
          })
          edgeSet.add(key)
        }
      }
      if (f.wifeId && pm[f.wifeId]) {
        const key = `parent-${f.wifeId}-${childId}`
        if (!edgeSet.has(key)) {
          edges.push({
            id: key,
            source: f.wifeId,
            target: childId,
            sourceHandle: 'bottom',
            targetHandle: 'top',
            type: 'smoothstep',
            style: highlightedEdgeSet.value.has(key)
              ? 'stroke: #059669; stroke-width: 3;'
              : 'stroke: #94a3b8; stroke-width: 2;',
            zIndex: highlightedEdgeSet.value.has(key) ? 2 : 1,
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