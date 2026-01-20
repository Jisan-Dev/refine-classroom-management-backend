import { and, desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import express from "express";
import { db } from "../db";
import { departments, subjects } from "../db/schema";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { department, search, page = 1, limit = 10 } = req.query;

    const currentPage = Math.max(1, parseInt(String(page), 10));
    const limitPerPage = Math.min(Math.max(1, parseInt(String(limit), 10) || 10), 100); // Max 100 per page
    const offset = (currentPage - 1) * limitPerPage;

    const filterConditions = [];

    if (search) {
      const searchPattern = `%${String(search).replace(/[%_]/g, "\\$&")}%`;
      filterConditions.push(
        or(ilike(subjects.name, searchPattern), ilike(subjects.code, searchPattern)),
      );
    }

    if (department) {
      // filterConditions.push(ilike(departments.name, `%${department}%`));
      const deptPattern = `%${String(department).replace(/[%_]/g, "\\$&")}%`;
      filterConditions.push(ilike(departments.name, deptPattern));
    }

    const whereClause = filterConditions.length ? and(...filterConditions) : undefined;

    // Count query MUST include the join
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(subjects)
      .leftJoin(departments, eq(subjects.departmentId, departments.id))
      .where(whereClause);

    const totalCount = countResult[0]?.count ?? 0;

    const subjectsList = await db
      .select({
        ...getTableColumns(subjects),
        department: { ...getTableColumns(departments) },
      })
      .from(subjects)
      .leftJoin(departments, eq(subjects.departmentId, departments.id))
      .where(whereClause)
      .orderBy(desc(subjects.createdAt))
      .limit(limitPerPage)
      .offset(offset);

    res.status(200).json({
      data: subjectsList,
      pagination: {
        page: currentPage,
        limit: limitPerPage,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitPerPage),
      },
    });
  } catch (error) {
    console.error("⛔ GET /subjects error:", error);
    res.status(500).json({ error: "Failed to fetch subjects due to an internal error." });
  }
});

export default router;
