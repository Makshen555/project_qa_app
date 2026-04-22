import prisma from "../config/db.js";
import { hashPassword } from "../utils/hash.js";

export const getAllUsers = async () => {
  return await prisma.user.findMany({
    include: {
      role: true,
    },
  });
};

export const getUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id: Number(id) },
    include: { role: true },
  });
};

export const createUser = async (data) => {
  if (!data.username || !data.email || !data.password || !data.roleId) {
    throw new Error("Campos obligatorios faltantes");
  }

  const hashedPassword = await hashPassword(data.password);

  return await prisma.user.create({
    data: {
      username: data.username,
      email: data.email,
      password: hashedPassword,
      roleId: Number(data.roleId),
    },
    include: {
      role: true,
    },
  });
};

export const updateUser = async (id, data) => {
  const userId = Number(id);

  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new Error("Usuario no encontrado");
  }

  let updateData = {};

  if (data.username) updateData.username = data.username;
  if (data.email) updateData.email = data.email;
  if (data.roleId) updateData.roleId = Number(data.roleId);

  if (data.password) {
    updateData.password = await hashPassword(data.password);
  }

  return await prisma.user.update({
    where: { id: userId },
    data: updateData,
    include: {
      role: true,
    },
  });
};

export const deleteUser = async (id) => {
  const userId = Number(id);

  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new Error("Usuario no encontrado");
  }

  return await prisma.user.delete({
    where: { id: userId },
  });
};