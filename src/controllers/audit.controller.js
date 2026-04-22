import prisma from "../config/db.js";

export const getLogs = async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo logs" });
  }
};