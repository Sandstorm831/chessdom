"use server";
import { Dispatch, SetStateAction } from "react";
import { Game, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient({ log: ["query", "info"] });

export async function getAllGames(page: number) {
  const games = await prisma.game.findMany({
    skip: (page - 1) * 20,
    take: 20,
  });
  return games;
}
