import fs from "fs"
import path from "path"
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers"
import { Chroma } from "langchain/vectorstores"
import { v4 as uuidv4 } from "uuid"

// Load nursery data
const dataPath = path.join(__dirname, "../lib/data.ts")
const nurseries: Array<{
  id: string
  name: string
  branch: string
  phone: string
  description: string
  address: string
}> = require(dataPath).nurseries

// Choose the embedding model (multilingual, good for Arabic)
const modelName = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"

async function main() {
  const embedder = new HuggingFaceTransformersEmbeddings({ modelName })
  const texts = nurseries.map(n => `${n.name} | ${n.description} | ${n.address} | ${n.branch}`)
  const metadatas = nurseries.map(n => ({ id: n.id, name: n.name, branch: n.branch, phone: n.phone, description: n.description, address: n.address }))

  // Create ChromaDB vector store
  const vectorStore = await Chroma.fromTexts(texts, metadatas, embedder, { collectionName: "nurseries" })
  await vectorStore.save(path.join(__dirname, "../chroma_nurseries"))
  console.log("Nursery data vectorized and indexed in ChromaDB!")
}

main().catch(console.error)
