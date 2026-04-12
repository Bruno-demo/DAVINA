import { Request, Response, NextFunction } from "express";

// Generic validation helper
function validateFields(
  body: any,
  rules: Record<string, { required?: boolean; type?: string; minLength?: number; maxLength?: number; pattern?: RegExp; message?: string }>
): string[] {
  const errors: string[] = [];
  for (const [field, rule] of Object.entries(rules)) {
    const value = body[field];
    if (rule.required && (value === undefined || value === null || value === "")) {
      errors.push(rule.message || `${field} is required.`);
      continue;
    }
    if (value !== undefined && value !== null && value !== "") {
      if (rule.type === "string" && typeof value !== "string") {
        errors.push(`${field} must be a string.`);
      }
      if (rule.type === "number" && (typeof value !== "number" || isNaN(value))) {
        errors.push(`${field} must be a number.`);
      }
      if (rule.minLength && typeof value === "string" && value.length < rule.minLength) {
        errors.push(`${field} must be at least ${rule.minLength} characters.`);
      }
      if (rule.maxLength && typeof value === "string" && value.length > rule.maxLength) {
        errors.push(`${field} must be at most ${rule.maxLength} characters.`);
      }
      if (rule.pattern && typeof value === "string" && !rule.pattern.test(value)) {
        errors.push(rule.message || `${field} has an invalid format.`);
      }
    }
  }
  return errors;
}

function sendValidationError(res: Response, errors: string[]): void {
  res.status(400).json({ errors });
}

// --- User Routes ---

export function validateRegister(req: Request, res: Response, next: NextFunction): void {
  const errors = validateFields(req.body, {
    name: { required: true, type: "string", minLength: 2, maxLength: 100 },
    email: {
      required: true,
      type: "string",
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "A valid email address is required.",
    },
    password: { required: true, type: "string", minLength: 6, maxLength: 128 },
  });
  if (errors.length) { sendValidationError(res, errors); return; }
  next();
}

export function validateLogin(req: Request, res: Response, next: NextFunction): void {
  const errors = validateFields(req.body, {
    email: {
      required: true,
      type: "string",
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "A valid email address is required.",
    },
    password: { required: true, type: "string" },
  });
  if (errors.length) { sendValidationError(res, errors); return; }
  next();
}

// --- Product Routes ---

export function validateCreateProduct(req: Request, res: Response, next: NextFunction): void {
  const errors = validateFields(req.body, {
    p_name: { required: true, type: "string", minLength: 1, maxLength: 200 },
    price: { required: true, type: "number" },
    category: { required: true, type: "string" },
  });
  if (req.body.price !== undefined && req.body.price < 0) {
    errors.push("price must be a positive number.");
  }
  if (errors.length) { sendValidationError(res, errors); return; }
  next();
}

export function validateUpdateProduct(req: Request, res: Response, next: NextFunction): void {
  const errors: string[] = [];
  if (req.body.price !== undefined && (typeof req.body.price !== "number" || req.body.price < 0)) {
    errors.push("price must be a positive number.");
  }
  if (req.body.p_name !== undefined && (typeof req.body.p_name !== "string" || req.body.p_name.length === 0)) {
    errors.push("p_name must be a non-empty string.");
  }
  if (req.body.stock !== undefined && (typeof req.body.stock !== "number" || req.body.stock < 0)) {
    errors.push("stock must be a non-negative number.");
  }
  if (errors.length) { sendValidationError(res, errors); return; }
  next();
}

// --- Cart Routes ---

export function validateAddToCart(req: Request, res: Response, next: NextFunction): void {
  const errors = validateFields(req.body, {
    product_id: { required: true, type: "string" },
    quantity: { required: true, type: "number" },
  });
  if (req.body.quantity !== undefined && req.body.quantity < 1) {
    errors.push("quantity must be at least 1.");
  }
  if (errors.length) { sendValidationError(res, errors); return; }
  next();
}

export function validateUpdateCartItem(req: Request, res: Response, next: NextFunction): void {
  const errors = validateFields(req.body, {
    product_id: { required: true, type: "string" },
    quantity: { required: true, type: "number" },
  });
  if (req.body.quantity !== undefined && req.body.quantity < 0) {
    errors.push("quantity must be non-negative.");
  }
  if (errors.length) { sendValidationError(res, errors); return; }
  next();
}

// --- Payment Routes ---

const VALID_METHODS = ["paystack", "momo", "airtel", "bank_transfer", "cod"];

export function validatePayment(req: Request, res: Response, next: NextFunction): void {
  const errors = validateFields(req.body, {
    order_id: { required: true },
    method: { required: true, type: "string" },
  });
  if (req.body.method && !VALID_METHODS.includes(req.body.method)) {
    errors.push(`method must be one of: ${VALID_METHODS.join(", ")}`);
  }
  if (errors.length) { sendValidationError(res, errors); return; }
  next();
}

// --- Order Routes ---

export function validateGuestOrder(req: Request, res: Response, next: NextFunction): void {
  const errors = validateFields(req.body, {
    guest_email: {
      required: true,
      type: "string",
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "A valid guest email is required.",
    },
    ordered_items: { required: true },
  });
  if (req.body.ordered_items && !Array.isArray(req.body.ordered_items)) {
    errors.push("ordered_items must be an array.");
  }
  if (Array.isArray(req.body.ordered_items) && req.body.ordered_items.length === 0) {
    errors.push("ordered_items cannot be empty.");
  }
  if (errors.length) { sendValidationError(res, errors); return; }
  next();
}
