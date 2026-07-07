"""Shared diagram-type metadata used by the guardrail and graph agents so both
speak the same human-readable names — adding a new diagram type only requires
adding an entry here, never touching the agents themselves."""

DIAGRAM_TYPE_NAMES: dict[str, str] = {
    "mindmap": "Mind Map",
    "flowchart": "Flowchart",
    "roadmap": "Roadmap",
    "concept_map": "Concept Map",
    "process_diagram": "Process Diagram",
}


def diagram_type_name(diagram_type: str) -> str:
    return DIAGRAM_TYPE_NAMES.get(diagram_type, diagram_type.replace("_", " ").title())
