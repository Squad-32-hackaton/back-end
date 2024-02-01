import projectSchema from "../zodSchemas/projectSchema.js";
import { z } from "zod";
import { NotFoundError } from "../helpers/api-errors.js";
import * as projectService from "../services/projectService.js";
import * as tagService from "../services/tagService.js";

export async function create(req, res) {
    const { id: user_id } = req.params;

    const body = projectSchema.safeParse(req.body);
    if (!body.success) {
        const errors = body.error.issues.map((issue) => issue.message);
        return res.status(400).json({ errors });
    }

    const projectData = {
        user_id: parseInt(user_id),
        ...body.data,
        tags: undefined,
    };

    const project = await projectService.create(projectData);

    const tagsData = body.data.tags.map((tag) => ({
        name: tag,
        project_id: project.project_id,
    }));

    await tagService.createMany(tagsData);

    const projectResponse = {
        ...project,
        tags: body.data.tags,
    };

    res.status(201).json({ project: projectResponse });
}

export async function getProjects(req, res) {
    const { id } = req.params;

    const paramsSchema = z.object({
        user_id: z
            .number({
                invalid_type_error: "Param 'user_id' must be a number",
            })
            .nullable(),
    });

    let user_id = id ? parseInt(id) : null;
    const params = paramsSchema.safeParse({ user_id });

    if (!params.success) {
        const errors = params.error.issues.map((issue) => issue.message);
        return res.status(400).json({ errors });
    }

    // If the ID was sent, then it should only show user's own projects
    const showOnlyUserProjects = !!params.data.user_id;
    user_id = params.data.user_id || req.user.user_id;

    const projects = await projectService.getProjects(
        user_id,
        showOnlyUserProjects,
    );
    return res.json({ projects });
}

export async function getUserProjectById(req, res) {
    const { user_id, id: project_id } = req.params;

    const project = await projectService.getUserProjectById(
        parseInt(user_id),
        parseInt(project_id),
    );

    if (!project) throw new NotFoundError("Project not found");

    return res.json({ project });
}

export async function getUserProjectsByTag(req, res) {
    const { id: user_id } = req.params;
    const { tag } = req.query;

    const paramsScema = z.object({
        user_id: z.number({
            invalid_type_error: "Param 'user_id' must be a number",
        }),
        tag: z.string({
            required_error: "Query string 'tag' is required",
        }),
    });

    const params = paramsScema.safeParse({ user_id: parseInt(user_id), tag });
    if (!params.success) {
        const errors = params.error.issues.map((issue) => issue.message);
        return res.status(400).json({ errors });
    }

    const projects = await projectService.getUserProjectsByTag(
        params.data.user_id,
        params.data.tag,
    );

    return res.json({ projects });
}
