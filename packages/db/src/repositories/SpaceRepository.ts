import { ObjectId } from 'mongodb';
import { getSpacesCollection, getSpaceMembersCollection, getUsersCollection } from '../collections.js';
import { SpaceDoc, SpaceMemberDoc, SpaceResponse, SpaceRole } from '@touch-grass/shared';

function toSpaceResponse(doc: SpaceDoc, membersCount: number): SpaceResponse {
  return {
    id: doc._id.toString(),
    name: doc.name,
    description: doc.description,
    createdBy: doc.createdBy,
    inviteCode: doc.inviteCode,
    membersCount,
    createdAt: doc.createdAt.toISOString(),
  };
}

export class SpaceRepository {
  static async findById(id: string): Promise<SpaceDoc | null> {
    if (!ObjectId.isValid(id)) return null;
    return getSpacesCollection().findOne({ _id: new ObjectId(id) });
  }

  static async findByInviteCode(inviteCode: string): Promise<SpaceDoc | null> {
    return getSpacesCollection().findOne({ inviteCode: inviteCode.trim().toUpperCase() });
  }

  static async create(name: string, description: string | undefined, createdByUserId: string): Promise<SpaceResponse> {
    // Generate simple 6-character random alphanumeric invite code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const spaceResult = await getSpacesCollection().insertOne({
      name,
      description,
      createdBy: createdByUserId,
      inviteCode,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const spaceId = spaceResult.insertedId.toString();

    // Add creator as owner member
    await getSpaceMembersCollection().insertOne({
      spaceId,
      userId: createdByUserId,
      role: 'owner',
      joinedAt: new Date(),
    } as any);

    return toSpaceResponse(
      {
        _id: spaceResult.insertedId,
        name,
        description,
        createdBy: createdByUserId,
        inviteCode,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      1
    );
  }

  static async addMember(spaceId: string, userId: string, role: SpaceRole = 'member'): Promise<boolean> {
    const existing = await getSpaceMembersCollection().findOne({ spaceId, userId });
    if (existing) return false;

    await getSpaceMembersCollection().insertOne({
      spaceId,
      userId,
      role,
      joinedAt: new Date(),
    } as any);

    return true;
  }

  static async removeMember(spaceId: string, userId: string): Promise<boolean> {
    const result = await getSpaceMembersCollection().deleteOne({ spaceId, userId });
    return result.deletedCount > 0;
  }

  static async isMember(spaceId: string, userId: string): Promise<boolean> {
    const member = await getSpaceMembersCollection().findOne({ spaceId, userId });
    return !!member;
  }

  static async getMembers(spaceId: string): Promise<SpaceMemberDoc[]> {
    return getSpaceMembersCollection().find({ spaceId }).toArray();
  }

  static async getSpacesForUser(userId: string): Promise<SpaceResponse[]> {
    const memberships = await getSpaceMembersCollection().find({ userId }).toArray();
    const spaceIds = memberships.map((m) => new ObjectId(m.spaceId));

    if (spaceIds.length === 0) return [];

    const spaces = await getSpacesCollection().find({ _id: { $in: spaceIds } }).toArray();

    const results: SpaceResponse[] = [];
    for (const space of spaces) {
      const count = await getSpaceMembersCollection().countDocuments({ spaceId: space._id.toString() });
      results.push(toSpaceResponse(space, count));
    }

    return results;
  }

  static async getSpaceDetails(spaceId: string): Promise<SpaceResponse | null> {
    const space = await this.findById(spaceId);
    if (!space) return null;

    const count = await getSpaceMembersCollection().countDocuments({ spaceId });
    return toSpaceResponse(space, count);
  }
}
