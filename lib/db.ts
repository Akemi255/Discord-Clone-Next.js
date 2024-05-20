import { PrismaClient } from '@prisma/client';

// Aplicar el patron Singleton para prevenir crear muchas instancias del cliente de prisma cada vez que guardemos los cambios en codigo (aka development mode) y cuando pasemos a produccion, esto cambiara.

declare global {
  var prisma: PrismaClient | undefined;
}

export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalThis.prisma = db;
