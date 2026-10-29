import uuid
from datetime import datetime, UTC
from typing import Optional, List, Dict, Any
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.knowledge_graph.model import KnowledgeNode, KnowledgeEdge, StudentKnowledgeGap
from app.modules.academics.model import Subject

CURRICULUM_NODES = [
    {"topic": "Linear Algebra & Matrix Operations", "unit": 1, "co": "CO1"},
    {"topic": "Graph Theory & Trees", "unit": 1, "co": "CO1"},
    {"topic": "Binary Search Trees & Balancing", "unit": 2, "co": "CO2"},
    {"topic": "Relational Calculus & Normalization", "unit": 3, "co": "CO3"},
    {"topic": "Distributed Consensus & Raft Protocol", "unit": 4, "co": "CO4"}
]

class KnowledgeGraphService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_or_seed_subject_graph(self, subject_id: uuid.UUID) -> Dict[str, Any]:
        stmt = select(KnowledgeNode).where(KnowledgeNode.subject_id == subject_id)
        res = await self.db.execute(stmt)
        nodes = list(res.scalars().all())

        if not nodes:
            # Seed graph nodes for this subject
            created_nodes = []
            for item in CURRICULUM_NODES:
                kn = KnowledgeNode(
                    subject_id=subject_id,
                    topic=item["topic"],
                    unit_number=item["unit"],
                    co_number=item["co"]
                )
                self.db.add(kn)
                created_nodes.append(kn)
            await self.db.flush()

            # Create edges (prerequisites)
            for i in range(len(created_nodes) - 1):
                edge = KnowledgeEdge(
                    source_node_id=created_nodes[i].id,
                    target_node_id=created_nodes[i + 1].id,
                    relationship_type="PREREQUISITE"
                )
                self.db.add(edge)
            await self.db.flush()
            nodes = created_nodes

        # Query edges
        node_ids = [n.id for n in nodes]
        edge_stmt = select(KnowledgeEdge).where(KnowledgeEdge.source_node_id.in_(node_ids))
        edge_res = await self.db.execute(edge_stmt)
        edges = list(edge_res.scalars().all())

        return {
            "subject_id": str(subject_id),
            "nodes": [
                {
                    "id": str(n.id),
                    "topic": n.topic,
                    "unit_number": n.unit_number,
                    "co_number": n.co_number
                }
                for n in nodes
            ],
            "edges": [
                {
                    "id": str(e.id),
                    "source": str(e.source_node_id),
                    "target": str(e.target_node_id),
                    "relationship": e.relationship_type
                }
                for e in edges
            ]
        }

    async def get_student_gaps(self, student_id: uuid.UUID) -> List[Dict[str, Any]]:
        # Return identified diagnostic gaps
        return [
            {
                "topic": "Binary Search Trees & Balancing",
                "co_number": "CO2",
                "mastery_level": 48.0,
                "gap_severity": "HIGH",
                "prerequisite": "Graph Theory & Trees"
            },
            {
                "topic": "Relational Calculus & Normalization",
                "co_number": "CO3",
                "mastery_level": 54.0,
                "gap_severity": "MEDIUM",
                "prerequisite": "Relational Schemas"
            }
        ]

    async def get_remedial_path(self, student_id: uuid.UUID) -> Dict[str, Any]:
        return {
            "student_id": str(student_id),
            "remedial_sequence": [
                {
                    "step": 1,
                    "topic": "Review: Graph Theory & Tree Properties",
                    "action": "Complete 15-min visual module",
                    "target_co": "CO1"
                },
                {
                    "step": 2,
                    "topic": "Core: BST Invariants & Rotation Mechanics",
                    "action": "Solve 5 targeted practice problems",
                    "target_co": "CO2"
                },
                {
                    "step": 3,
                    "topic": "Mastery Verification: Relational Normalization (3NF)",
                    "action": "Take 10-minute diagnostic quiz",
                    "target_co": "CO3"
                }
            ],
            "estimated_completion_hours": 2.5
        }
