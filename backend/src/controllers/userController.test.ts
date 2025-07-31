import { registerUser } from "./user.Controller";
import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { Request, Response } from "express";
import User from "../models/user";
import Warenkorb from "../models/warenkorb";
import bcrypt from "bcryptjs";
import { error } from "console";

jest.mock("../models/user");
jest.mock("../models/warenkorb");
jest.mock("bcryptjs", () => ({
  hash: jest.fn(() => "mockedHashedPassword123"),
}));

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
    jest.spyOn(User, "findOne").mockResolvedValue({ u_id: 1 } as any);

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

  it("returns 201 and creates user + warenkorb", async () => {
    jest.spyOn(User, "findOne").mockResolvedValue(null);
    jest.spyOn(User, "create").mockResolvedValue({ u_id: 42 } as any);
    jest.spyOn(Warenkorb, "create").mockResolvedValue({} as any);

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

    expect(Warenkorb.create).toHaveBeenCalledWith({
      user_id: 42,
      status: "Offen",
      ordered_items: [],
      total_price: 0.0,
    });

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ u_id: 42 });
  });

  it("returns 500 if an unexpected error occurs", async () => {
    jest.spyOn(User, "findOne").mockRejectedValue(new Error("DB exploded"));
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
