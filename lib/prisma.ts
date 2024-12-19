import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = (): PrismaClient => {
  return new PrismaClient();
};

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

const prisma = global.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  global.prismaGlobal = prisma;
}

export default prisma;