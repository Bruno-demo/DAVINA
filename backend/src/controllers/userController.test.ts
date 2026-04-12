import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import type { Request, Response } from "express";

jest.mock("../models/user", () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock("../models/cart", () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
  },
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(() => "mockedHashedPassword123"),
}));

const User = require("../models/user").default as any;
const Cart = require("../models/cart").default as any;
const { registerUser } = require("./user.Controller") as typeof import("./user.Controller");

describe("registerUser", () => {
  beforeAll(()=>{
    jest.spyOn(console,"error").mockImplementation(()=> {});
  });

  it("returns 400 if name, email, or password is missing", async () => {
    const req = {
      body: {},
    } as Partial<Request>;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as Partial<Response>;

    await registerUser(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Name, Email, or Password is missing.",
    });
  });
  it("returns 409 if user already exists", async () => {
    User.findOne.mockResolvedValue({ u_id: 1 } as any);

    const req = {
      body: {
        name: "Test User",
        email: "test.user@example.com",
        password: "testuser123",
      },
    } as Partial<Request>;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as Partial<Response>;

    await registerUser(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: "The user is already registered.",
    });
  });

  it("returns 201 and creates user + cart", async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ u_id: 42 } as any);
    Cart.create.mockResolvedValue({} as any);

    const req = {
      body: {
        name: "New Test User",
        email: "newuser@example.com",
        password: "password123",
      },
    } as Partial<Request>;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as Partial<Response>;

    await registerUser(req as Request, res as Response);

    expect(User.create).toHaveBeenCalledWith({
      u_name: "New Test User",
      u_email: "newuser@example.com",
      u_password: "mockedHashedPassword123",
      u_role: "user",
    });

    expect(Cart.create).toHaveBeenCalledWith({
      user_id: 42,
      status: "Open",
      ordered_items: [],
      total_price: 0.0,
    });

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ u_id: 42 });
  });

  it("returns 500 if an unexpected error occurs", async () => {
    User.findOne.mockRejectedValue(new Error("DB exploded"));
    const req = {
      body: {
        name: "Oops",
        email: "oops@example.com",
        password: "fail",
      },
    } as Partial<Request>;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as Partial<Response>;

    await registerUser(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to create user",
    });
  });
});
