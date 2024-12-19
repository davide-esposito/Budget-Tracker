import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = (): PrismaClient => {
  return new PrismaClient();
};

declare global {
  namespace NodeJS {
    interface Global {
      prismaGlobal?: PrismaClient;
    }
  }
}

const prisma = global.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  global.prismaGlobal = prisma;
}

export default prisma;