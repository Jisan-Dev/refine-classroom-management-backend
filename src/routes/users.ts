import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import express from "express";
import { db } from "../db/index.js";
import { user } from "../db/schema/auth.js";

const router = express.Router();

// Get all users with optional search, role filter, and pagination
router.get("/", async (req, res) => {
  try {
    const { search, role, page = 1, limit = 10 } = req.query;

    const currentPage = Math.max(1, parseInt(String(page), 10));
    const limitPerPage = Math.min(Math.max(1, parseInt(String(limit), 10)), 100);
    const offset = (currentPage - 1) * limitPerPage;

    const filterConditions = [];

    if (search) {
      const searchPattern = `%${String(search).replace(/[%_]/g, "\\$&")}%`;
      filterConditions.push(or(ilike(user.name, searchPattern), ilike(user.email, searchPattern)));
    }

    if (role) {
      filterConditions.push(eq(user.role, role as UserRoles));
    }

    const whereClause = filterConditions.length ? and(...filterConditions) : undefined;

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(user)
      .where(whereClause);
    const totalCount = countResult[0]?.count ?? 0;

    const usersList = await db
      .select()
      .from(user)
      .where(whereClause)
      .orderBy(desc(user.createdAt))
      .limit(limitPerPage)
      .offset(offset);

    res.status(200).json({
      data: usersList,
      pagination: {
        page: currentPage,
        limit: limitPerPage,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitPerPage),
      },
    });
  } catch (error) {
    console.error("⛔ GET /users error:", error);
    res.status(500).json({ error: "Failed to fetch users due to an internal error." });
  }
});

export default router;
