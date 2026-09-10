"""
Phase 9: Query Decomposition Engine
===================================
Decomposes complex legal queries into discrete, targeted research sub-tasks.
Each task specifies target corpus, search query, authority requirements, and currentness criteria.
"""

from typing import List, Dict, Any


class ResearchSubTask:
    def __init__(
        self,
        task_id: str,
        description: str,
        query: str,
        target_corpus: str,
        authority_level: int = 1,
        currentness_mode: str = "CURRENT",
        max_results: int = 3
    ):
        self.task_id = task_id
        self.description = description
        self.query = query
        self.target_corpus = target_corpus
        self.authority_level = authority_level
        self.currentness_mode = currentness_mode
        self.max_results = max_results

    def to_dict(self) -> Dict[str, Any]:
        return {
            "task_id": self.task_id,
            "description": self.description,
            "query": self.query,
            "target_corpus": self.target_corpus,
            "authority_level": self.authority_level,
            "currentness_mode": self.currentness_mode,
            "max_results": self.max_results
        }


def decompose_legal_query(
    query: str,
    extracted_params: Dict[str, Any],
    case_id: str = None
) -> List[Dict[str, Any]]:
    """
    Decomposes a primary user query into 3 to 5 targeted sub-research tasks based on legal domain
    and statutory/precedent requirements.
    """
    domain = extracted_params.get("domain", "General Legal")
    currentness_req = extracted_params.get("currentness_requirement", "CURRENT")
    research_depth = extracted_params.get("research_depth", "STANDARD")
    tasks: List[ResearchSubTask] = []

    # Task 1: Statutory Authority Search
    stat_query = f"{query} statutory provision section Act"
    tasks.append(
        ResearchSubTask(
            task_id="task_statute_1",
            description="Find primary statutory provisions and legislative text",
            query=stat_query,
            target_corpus="GLOBAL_STATUTES",
            authority_level=1,
            currentness_mode=currentness_req,
            max_results=3 if research_depth != "DEEP" else 5
        )
    )

    # Task 2: Judicial Precedent Search
    prec_query = f"{query} Supreme Court landmark judgment precedent holding"
    tasks.append(
        ResearchSubTask(
            task_id="task_precedent_2",
            description="Find Supreme Court & High Court binding precedent judgments",
            query=prec_query,
            target_corpus="GLOBAL_PRECEDENTS",
            authority_level=1,
            currentness_mode="CURRENT",
            max_results=3 if research_depth != "DEEP" else 5
        )
    )

    # Task 3: Constitutional Principles (if Constitutional domain or deep mode)
    if domain in ["Constitutional Law", "Criminal Procedure", "Law of Evidence"] or research_depth == "DEEP":
        const_query = f"{query} Article Constitution fundamental rights"
        tasks.append(
            ResearchSubTask(
                task_id="task_constitution_3",
                description="Identify relevant constitutional principles and fundamental rights",
                query=const_query,
                target_corpus="GLOBAL_CONSTITUTION",
                authority_level=1,
                currentness_mode="CURRENT",
                max_results=2
            )
        )

    # Task 4: Case-Scoped Record Search (if case_id supplied)
    if case_id and str(case_id).strip():
        tasks.append(
            ResearchSubTask(
                task_id="task_casescoped_4",
                description=f"Retrieve isolated confidential case records for Case {case_id}",
                query=query,
                target_corpus="CASE_SCOPED",
                authority_level=2,
                currentness_mode="CURRENT",
                max_results=4
            )
        )

    # Task 5: Statutory Transition & Currentness Verification Task
    if currentness_req in ["HISTORICAL", "TRANSITIONAL"]:
        tasks.append(
            ResearchSubTask(
                task_id="task_transition_5",
                description="Verify statutory transition rules between IPC/CrPC/IEA and BNS/BNSS/BSA",
                query=f"{query} transition repealed superseded replaced",
                target_corpus="GLOBAL_STATUTES",
                authority_level=1,
                currentness_mode=currentness_req,
                max_results=3
            )
        )

    return [t.to_dict() for t in tasks]
