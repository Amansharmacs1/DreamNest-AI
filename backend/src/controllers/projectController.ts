import { Request, Response } from 'express';
import { Project } from '../models/Project';
import crypto from 'crypto';

export const getProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const projects = await Project.find({ ownerId: (req as any).userId }).sort({ updatedAt: -1 });
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, plotDimensions, usableArea, preferences, rooms, analysis } = req.body;
    
    const newProject = new Project({
      ownerId: (req as any).userId,
      name,
      plotDimensions,
      usableArea,
      preferences,
      rooms,
      analysis,
    });

    await newProject.save();
    res.status(201).json(newProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
};

export const updateProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const project = await Project.findOneAndUpdate(
      { _id: id, ownerId: (req as any).userId },
      { $set: req.body },
      { new: true }
    );

    if (!project) {
      res.status(404).json({ error: 'Project not found or unauthorized' });
      return;
    }

    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
};

export const getProjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const project = await Project.findOne({ _id: id, ownerId: (req as any).userId });

    if (!project) {
      res.status(404).json({ error: 'Project not found or unauthorized' });
      return;
    }

    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
};

export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const project = await Project.findOneAndDelete({ _id: id, ownerId: (req as any).userId });

    if (!project) {
      res.status(404).json({ error: 'Project not found or unauthorized' });
      return;
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
};

export const generateShareLink = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const project = await Project.findOne({ _id: id, ownerId: (req as any).userId });

    if (!project) {
      res.status(404).json({ error: 'Project not found or unauthorized' });
      return;
    }

    if (!project.shareToken) {
      project.shareToken = crypto.randomBytes(16).toString('hex');
      project.isPublic = true;
      await project.save();
    }

    res.json({ shareToken: project.shareToken, isPublic: project.isPublic });
  } catch (error) {
    console.error('Error generating share link:', error);
    res.status(500).json({ error: 'Failed to generate share link' });
  }
};

export const getSharedProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { shareToken } = req.params;
    const project = await Project.findOne({ shareToken, isPublic: true }).select('-ownerId');

    if (!project) {
      res.status(404).json({ error: 'Shared project not found' });
      return;
    }

    res.json(project);
  } catch (error) {
    console.error('Error fetching shared project:', error);
    res.status(500).json({ error: 'Failed to fetch shared project' });
  }
};
