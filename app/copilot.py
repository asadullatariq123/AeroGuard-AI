
import os
import time

from dotenv import load_dotenv
from google import genai
from google.genai.errors import APIError, ServerError

from rag.retriever import retrieve_documents

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError(
        "GEMINI_API_KEY not found. Check the .env file in the project root."
    )

client = genai.Client(api_key=API_KEY)


def ask_copilot(question: str) -> str:
    documents = retrieve_documents(question)

    if not documents:
        context = "No relevant maintenance documents were found."
    else:
        context_parts = []

        for index, document in enumerate(documents, start=1):
            text_content = document.get("text", "")
            source = document.get("source", "Unknown source")
            page = document.get("page", "Unknown page")

            context_parts.append(
                f"""
Document {index}
Source: {source}
Page: {page}
Content:
{text_content}
"""
            )

        context = "\n".join(context_parts)

    prompt = f"""
You are AeroGuard AI, an aircraft maintenance information assistant.

Your task is to answer questions using the retrieved maintenance documents.

IMPORTANT RULES:
1. Use the provided context to answer.
2. Do not invent aircraft maintenance information.
3. If the answer is not available in the context, clearly say:
   "The available maintenance documents do not contain this information."
4. Mention the source document and page number whenever available.
5. Use simple, clear, professional language.
6. Never present your response as authorization to perform aircraft maintenance.
7. Actual maintenance decisions must be made by authorized aviation maintenance personnel.

RETRIEVED CONTEXT:
{context}

USER QUESTION:
{question}

ANSWER:
"""

    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model="gemini-3.8-flash",
                contents=prompt
            )

            if response.text:
                return response.text

            return "Gemini returned an empty response. Please try again."

        except ServerError as error:
            if attempt < 2:
                wait_time = 5 * (attempt + 1)

                print(
                    f"Gemini server is busy. "
                    f"Retrying in {wait_time} seconds..."
                )

                time.sleep(wait_time)
            else:
                return (
                    "Gemini is currently experiencing high demand. "
                    "Please try again later."
                )

        except APIError as error:
            return f"Gemini API error: {error}"

        except Exception as error:
            return f"Unexpected error: {error}"

    return "Unable to generate an answer. Please try again."


if __name__ == "__main__":
    question = input("Ask AeroGuard AI: ")

    print("\nAeroGuard AI is processing your question...\n")

    answer = ask_copilot(question)

    print("\nAeroGuard AI Answer:\n")
    print(answer)
