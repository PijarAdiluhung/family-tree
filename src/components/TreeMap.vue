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
import dagre from 'dagre'
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

  const g = new dagre.graphlib.Graph()
  g.setGraph({ rankdir: 'TB', ranksep: 60, nodesep: 25, marginx: 30, marginy: 30 })
  g.setDefaultEdgeLabel(() => ({}))

  for (const p of props.people) {
    g.setNode(p.id, { label: p.name, width: 110, height: 52 })
  }

  const parentChildEdges = new Set()
  for (const f of props.families) {
    if (f.husbandId && f.wifeId) {
      if (!parentChildEdges.has(`${f.husbandId}-${f.wifeId}`)) {
        g.setEdge(f.husbandId, f.wifeId, { style: 'stroke: #cbd5e1; stroke-dasharray: 4,4;', arrowhead: 'none' })
        parentChildEdges.add(`${f.husbandId}-${f.wifeId}`)
      }
    }
    for (const childId of f.childIds || []) {
      if (f.husbandId) {
        const key = `${f.husbandId}-${childId}`
        if (!parentChildEdges.has(key)) {
          g.setEdge(f.husbandId, childId)
          parentChildEdges.add(key)
        }
      }
      if (f.wifeId) {
        const key = `${f.wifeId}-${childId}`
        if (!parentChildEdges.has(key)) {
          g.setEdge(f.wifeId, childId)
          parentChildEdges.add(key)
        }
      }
    }
  }

  dagre.layout(g)

  const nodes = []
  for (const id of g.nodes()) {
    const dagreNode = g.node(id)
    const person = peopleMap.value[id]
    nodes.push({
      id,
      type: 'person',
      position: {
        x: dagreNode.x - dagreNode.width / 2,
        y: dagreNode.y - dagreNode.height / 2,
      },
      data: { person },
    })
  }

  return nodes
})

const flowEdges = computed(() => {
  const edges = []
  const edgeSet = new Set()
  for (const f of props.families) {
    if (f.husbandId && f.wifeId) {
      const key = `spouse-${f.husbandId}-${f.wifeId}`
      if (!edgeSet.has(key)) {
        edges.push({
          id: key,
          source: f.husbandId,
          target: f.wifeId,
          style: 'stroke: #cbd5e1; stroke-width: 2; stroke-dasharray: 6,3;',
          type: 'smoothstep',
          animated: false,
          zIndex: 0,
        })
        edgeSet.add(key)
      }
    }
    for (const childId of f.childIds || []) {
      if (f.husbandId) {
        const key = `parent-${f.husbandId}-${childId}`
        if (!edgeSet.has(key)) {
          edges.push({
            id: key,
            source: f.husbandId,
            target: childId,
            type: 'smoothstep',
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
            type: 'smoothstep',
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
