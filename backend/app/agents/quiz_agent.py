from bson import ObjectId
from crewai import Agent, Crew, Task

from app.agents.llm import get_gemini_llm
from app.agents.schemas import QuizSchema
from app.models.lesson import Lesson, QuizQuestion


def build_quiz_agent() -> Agent:
    return Agent(
        role="Quiz Agent",
        goal="Write fair, well-explained quiz questions that test real understanding of a lesson.",
        backstory=(
            "You are an assessment designer who writes quiz questions that test genuine "
            "comprehension rather than trivia, and always explain why the correct answer "
            "is correct."
        ),
        llm=get_gemini_llm(temperature=0.5),
        verbose=False,
    )


def _lesson_text_summary(lesson: Lesson) -> str:
    lines = [f"Lesson: {lesson.title}", "Objectives: " + "; ".join(lesson.objectives)]
    for block in lesson.content:
        text = block.model_dump().get("text")
        if text:
            lines.append(text)
    return "\n".join(lines)


def _build_quiz_task(agent: Agent, lesson: Lesson) -> Task:
    return Task(
        description=(
            "Based on the following lesson content, write 4-5 quiz questions that test "
            "real understanding of the material.\n\n"
            f"{_lesson_text_summary(lesson)}\n\n"
            "Mix question types where appropriate: mcq, true_false, fill_blank, and coding "
            "(coding only if the lesson genuinely involves code). For 'mcq' provide 3-5 "
            "options with 'correct_answer' matching one option exactly. For 'true_false' "
            "options should be ['True', 'False']. For 'fill_blank'/'coding', options can be "
            "omitted. Always include a clear 'explanation' for why the correct answer is "
            "correct."
        ),
        expected_output="4-5 quiz questions with explanations.",
        agent=agent,
        output_pydantic=QuizSchema,
    )


async def generate_quiz(lesson: Lesson) -> list[QuizQuestion]:
    agent = build_quiz_agent()
    task = _build_quiz_task(agent, lesson)
    crew = Crew(agents=[agent], tasks=[task], verbose=False)
    await crew.kickoff_async()
    result: QuizSchema = task.output.pydantic
    return [QuizQuestion(id=str(ObjectId()), **q.model_dump()) for q in result.questions]
