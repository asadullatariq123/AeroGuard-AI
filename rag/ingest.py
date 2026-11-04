
from pathlib import Path
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer
import chromadb

BASE_DIR = Path(__file__).parent
DOCUMENTS_DIR = BASE_DIR / "documents"
VECTOR_DB_DIR = BASE_DIR / "vector_db"

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
COLLECTION_NAME = "aircraft_maintenance"

CHUNK_SIZE = 1000
CHUNK_OVERLAP = 150


def load_documents():
    documents = []

    for file_path in DOCUMENTS_DIR.iterdir():
        if file_path.suffix.lower() == ".pdf":
            reader = PdfReader(str(file_path))

            for page_number, page in enumerate(reader.pages, start=1):
                text = page.extract_text() or ""

                if text.strip():
                    documents.append({
                        "text": text,
                        "source": file_path.name,
                        "page": page_number
                    })

        elif file_path.suffix.lower() == ".txt":
            text = file_path.read_text(encoding="utf-8")

            if text.strip():
                documents.append({
                    "text": text,
                    "source": file_path.name,
                    "page": 1
                })

    return documents


def split_text(text):
    chunks = []
    start = 0

    while start < len(text):
        end = start + CHUNK_SIZE
        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        start += CHUNK_SIZE - CHUNK_OVERLAP

    return chunks


def main():
    documents = load_documents()

    if not documents:
        print("No PDF or TXT documents found in rag/documents.")
        print("Add maintenance documents before running ingestion.")
        return

    model = SentenceTransformer(MODEL_NAME)

    client = chromadb.PersistentClient(
        path=str(VECTOR_DB_DIR)
    )

    collection = client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"description": "Aircraft maintenance knowledge"}
    )

    ids = []
    texts = []
    metadatas = []

    for document in documents:
        chunks = split_text(document["text"])

        for chunk_index, chunk in enumerate(chunks):
            ids.append(
                f'{document["source"]}_{document["page"]}_{chunk_index}'
            )

            texts.append(chunk)

            metadatas.append({
                "source": document["source"],
                "page": document["page"]
            })

    embeddings = model.encode(
        texts,
        normalize_embeddings=True,
        show_progress_bar=True
    ).tolist()

    collection.upsert(
        ids=ids,
        documents=texts,
        metadatas=metadatas,
        embeddings=embeddings
    )

    print(f"Successfully indexed {len(texts)} text chunks.")
    print(f"Stored in ChromaDB collection: {COLLECTION_NAME}")


if __name__ == "__main__":
    main()
