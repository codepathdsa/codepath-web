import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-032',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Fat Controller — Logic in the Route Handler',
  companies: ['Spotify', 'SoundCloud'],
  timeEst: '~30 min',
  level: 'Mid',
  status: 'Not Started',
  desc: 'A playlist API route handler has 120 lines of business logic mixed with HTTP parsing and DB calls. Unit testing is impossible. Extract to a PlaylistService with a clean interface.',
  solution: 'Create PlaylistService with createPlaylist, addTrack, getPlaylist methods. Move all business logic there. The route handler becomes 5 lines: parse → call service → respond.',
  lang: 'TypeScript',
  tribunalData: {
    background: `The playlist controller is 120 lines. It handles parsing, validates business rules (max 10,000 tracks, no duplicate tracks, collaborative playlist permissions), queries the DB, and builds the response — all in one function.\n\nWhen a bug is reported in duplicate-track validation, the engineer has to understand all 120 lines to fix 3.\n\nYour mission: extract business logic to PlaylistService.`,
    folderPath: 'src/playlists',
    primaryFile: 'playlistService.ts',
    files: [
      {
        name: 'controller.ts',
        lang: 'typescript',
        code: `import { Router } from 'express';
import { db } from '../db';

const router = Router();

// TODO: Move all business logic to PlaylistService.
// The controller should only: parse request → call service → send response.
router.post('/playlists/:id/tracks', async (req, res) => {
  const { id } = req.params;
  const { trackId, userId } = req.body;

  // Business rule 1: only collaborators can add tracks
  const playlist = await db.query('SELECT * FROM playlists WHERE id=$1', [id]);
  if (!playlist.rows[0]) return res.status(404).json({ error: 'Not found' });
  const isCollaborator = playlist.rows[0].collaborators.includes(userId);
  const isOwner = playlist.rows[0].owner_id === userId;
  if (!isCollaborator && !isOwner) return res.status(403).json({ error: 'Forbidden' });

  // Business rule 2: max 10,000 tracks
  const count = await db.query('SELECT COUNT(*) FROM playlist_tracks WHERE playlist_id=$1', [id]);
  if (parseInt(count.rows[0].count) >= 10000) return res.status(400).json({ error: 'Playlist full' });

  // Business rule 3: no duplicate tracks
  const existing = await db.query(
    'SELECT 1 FROM playlist_tracks WHERE playlist_id=$1 AND track_id=$2', [id, trackId]
  );
  if (existing.rows.length > 0) return res.status(409).json({ error: 'Already in playlist' });

  await db.query('INSERT INTO playlist_tracks(playlist_id, track_id) VALUES($1,$2)', [id, trackId]);
  res.status(201).json({ success: true });
});

export default router;`,
      },
      {
        name: 'playlistService.ts',
        lang: 'typescript',
        code: `import { db } from '../db';

// TODO: Implement PlaylistService with the three business rules.
export class PlaylistService {
  async addTrack(playlistId: string, trackId: string, userId: string): Promise<void> {
    // TODO: extract logic from controller here
    throw new Error('Not implemented');
  }
}`,
      },
    ],
    objectives: [
      {
        label: 'Move collaborator check into PlaylistService.addTrack',
        check: { type: 'contains', file: 'playlistService.ts', pattern: 'collaborator' },
      },
      {
        label: 'Move duplicate track check into PlaylistService.addTrack',
        check: { type: 'contains', file: 'playlistService.ts', pattern: 'playlist_tracks' },
      },
      {
        label: 'Simplify controller to call PlaylistService (under 20 lines)',
        check: { type: 'contains', file: 'controller.ts', pattern: 'PlaylistService' },
      },
      {
        label: 'Remove direct db.query calls from controller.ts',
        check: { type: 'not_contains', file: 'controller.ts', pattern: 'db.query' },
      },
    ],
    hints: [
      'Define custom error classes: `PlaylistFullError`, `DuplicateTrackError`, `ForbiddenError`. Throw from service, catch in controller and map to HTTP status codes.',
      'The service takes primitives (no req/res) — making it trivially unit-testable by injecting a mock db.',
      'Controller pattern: `try { await service.addTrack(...); res.status(201).json({success:true}); } catch(e) { /* map error to status */ }`',
    ],
    totalTests: 22,
    testFramework: 'Jest',
    xp: 290,
    successMessage: `The controller is 10 lines. The service is 40 lines of pure business logic, fully unit-testable without HTTP concerns. Adding a new endpoint reuses the same service with different HTTP plumbing.`,
  },
};

export default challenge;
