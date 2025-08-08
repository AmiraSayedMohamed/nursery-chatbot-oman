import fs from "fs"
import path from "path"
import { InferenceClient } from "@huggingface/inference"
import { ChromaClient, Collection } from "chromadb"

// Load nursery data
const dataPath = path.join(__dirname, "../lib/data.ts")
const nurseries = require(dataPath).nurseries

// Hugging Face API setup (you need a free HF API key)
const HF_API_KEY = process.env.HF_API_KEY || ""
const hf = new InferenceClient(HF_API_KEY)
const model = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"

async function embed(text: string): Promise<number[]> {
  const res = await hf.featureExtraction({ model, inputs: text })
  if (Array.isArray(res)) return res as number[]
  throw new Error("Embedding failed")
}

async function main() {
  const client = new ChromaClient()
  let collection: Collection
  try {
    collection = await client.getOrCreateCollection({ name: "nurseries" })
  } catch (e) {
    console.error("ChromaDB error:", e)
    return
  }

  for (const n of nurseries) {
    const text = `${n.name} | ${n.description} | ${n.address} | ${n.branch}`
    const embedding = await embed(text)
    await collection.add({
      ids: [n.id],
      embeddings: [embedding],
      metadatas: [{ ...n }],
      documents: [text],
    })
    console.log(`Indexed: ${n.name}`)
  }
  console.log("All nurseries indexed in ChromaDB!")
}

main().catch(console.error)
