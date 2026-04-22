import prisma from "../config/db.js";

export const logEvent = async ({
  userId = null,
  action,
  entity,
  entityId = null,
  ipAddress,
  details = null,
}) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        ipAddress,
        details,
      },
    });
  } catch (error) {
    console.error("Error guardando auditoría:", error);
  }
};