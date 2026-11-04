
import chromadb

DB_PATH = "rag/vector_db"
COLLECTION_NAME = "aircraft_maintenance"


def retrieve_documents(query: str, n_results: int = 3):
    client = chromadb.PersistentClient(path=DB_PATH)

    collection = client.get_collection(name=COLLECTION_NAME)

    results = collection.query(
        query_texts=[query],
        n_results=n_results
    )

    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]

    print("\nRAG SEARCH RESULTS")
    print("=" * 50)

    if not documents:
        print("No relevant documents found.")
        return

    for i, document in enumerate(documents):
        print(f"\nResult {i + 1}")
        print(f"Document: {document}")

        if i < len(metadatas):
            print(f"Source: {metadatas[i]}")


if __name__ == "__main__":
    question = input("Enter aircraft maintenance question: ")
    retrieve_documents(question)
