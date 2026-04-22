import * as service from "../services/product.service.js";
import { logEvent } from "../services/audit.service.js";
import { getRequestInfo } from "../middlewares/audit.middleware.js";

export const getProducts = async (req, res) => {
  try {
    const products = await service.getAllProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo productos" });
  }
};

export const getProduct = async (req, res) => {
  try {
    const product = await service.getProductById(req.params.id);
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo producto" });
  }
};

export const createProduct = async (req, res) => {
  const { code, name, description, quantity, price } = req.body;
  const { ipAddress } = getRequestInfo(req);

  try {
    if (!code || !name || !description || quantity == null || price == null) {
      return res.status(400).json({ error: "Campos obligatorios faltantes" });
    }

    if (isNaN(quantity) || quantity < 0) {
      return res.status(400).json({ error: "Cantidad inválida" });
    }

    if (isNaN(price) || price < 0) {
      return res.status(400).json({ error: "Precio inválido" });
    }

    const product = await service.createProduct({
      code,
      name,
      description,
      quantity: Number(quantity),
      price: Number(price)
    });

    await logEvent({
      userId: req.user.id,
      action: "CREATE_PRODUCT",
      entity: "Product",
      entityId: product.id,
      ipAddress
    });

    res.status(201).json(product);

  } catch (error) {
    res.status(500).json({ error: "Error creando producto" });
  }
};

export const updateProduct = async (req, res) => {
  const { ipAddress } = getRequestInfo(req);

  try {
    const product = await service.updateProduct(req.params.id, req.body);

    await logEvent({
      userId: req.user.id,
      action: "UPDATE_PRODUCT",
      entity: "Product",
      entityId: product.id,
      ipAddress
    });

    res.json(product);

  } catch (error) {
    res.status(500).json({ error: "Error actualizando producto" });
  }
};

export const deleteProduct = async (req, res) => {
  const { ipAddress } = getRequestInfo(req);

  try {
    await service.deleteProduct(req.params.id);

    await logEvent({
      userId: req.user.id,
      action: "DELETE_PRODUCT",
      entity: "Product",
      entityId: Number(req.params.id),
      ipAddress
    });

    res.json({ message: "Producto eliminado" });

  } catch (error) {
    res.status(500).json({ error: "Error eliminando producto" });
  }
};