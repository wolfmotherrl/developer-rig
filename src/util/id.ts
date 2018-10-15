import { fetchUser } from './api';

export async function fetchIdForUser(authToken: string, userIdOrName: string): Promise<string> {
  if (isNaN(Number(userIdOrName))) {
    // Assume it's a channel (user) name.  Get the channel ID, if any.
    const user = await fetchUser(authToken, userIdOrName);
    if (user) {
      return user.id;
    } else {
      throw new Error(`Cannot fetch user for login "${userIdOrName}"`);
    }
  } else {
    // Ensure it's a valid user ID.
    const user = await fetchUser(authToken, userIdOrName, true);
    if (user) {
      return user.id;
    } else {
      throw new Error(`Cannot fetch user for id "${userIdOrName}"`);
    }
  }
}

const idSource: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function generateId(idLength: number): string {
  const length = idSource.length;
  return idSource.charAt(Math.floor(Math.random() * (length - 10))) + // Ensure first character is alphabetic.
    Array(idLength - 1).fill(0).map(_ => idSource.charAt(Math.floor(Math.random() * length))).join('');
}
