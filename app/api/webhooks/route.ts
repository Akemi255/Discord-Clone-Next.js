import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Obtener los encabezados
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // Si no hay encabezados, retornar error
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  // Obtener el cuerpo
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Crear una nueva instancia de Svix con tu secreto
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verificar el payload con los encabezados
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred", {
      status: 400,
    });
  }

  // Hacer algo con el payload
  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook with an ID of ${id} and type of ${eventType}`);
  console.log("Webhook body:", body);

  // Actualizar la imagen del perfil del usuario si el evento es "user.updated"
  if (eventType === "user.updated") {
    try {
      const { id: userId, image_url } = evt.data;
      const user = await db.profile.findUnique({
        where: { userId },
      });
      if (!user) {
        return new Response("User not found", { status: 404 });
      }
      await db.profile.update({
        where: { userId },
        data: { imageUrl: image_url },
      });

      console.log("User profile image updated successfully");
    } catch (error) {
      console.error("Error updating user profile image:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  }

  return NextResponse.json({ message: "OK" });
}
