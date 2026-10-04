/** Avatar alt when the same name is shown as visible text beside the image. */
export function decorativeAvatarAlt(
  adjacentNameVisible: boolean,
  name: string,
): string {
  return adjacentNameVisible ? "" : name;
}
