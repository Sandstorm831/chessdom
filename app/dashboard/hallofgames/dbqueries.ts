"use server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient({ log: ["query", "info"] });

export async function getAllGames(page: number) {
  const games = await prisma.game.findMany({
    skip: (page - 1) * 20,
    take: 20,
  });
  return games;
}

export async function getGamesCount() {
  const gamesCount = await prisma.game.count();
  return gamesCount;
}
