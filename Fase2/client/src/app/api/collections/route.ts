import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("principal");
    const collections = await db.listCollections().toArray();

    const collectionNames = collections.map((col) => col.name);
    return NextResponse.json(collectionNames);
  } catch (error) {
    console.error("Error al obtener colecciones:", error);
    return new NextResponse("Error interno del servidor", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { coleccion, pagina } = await req.json();

    if (!coleccion || typeof pagina !== "number") {
      return new NextResponse("Parámetros inválidos", { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("principal");
    const pageSize = 10;
    const skip = (pagina - 1) * pageSize;

    const total = await db.collection(coleccion).countDocuments();
    const datos = await db
      .collection(coleccion)
      .find({})
      .skip(skip)
      .limit(pageSize)
      .toArray();

    return NextResponse.json({ datos, total });
  } catch (error) {
    console.error("Error en POST /api/coleccion:", error);
    return new NextResponse("Error interno del servidor", { status: 500 });
  }
}
