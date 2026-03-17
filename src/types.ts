export interface FileSystemItem {
  name: string;
  content: string;
  language: string;
  path: string;
}

export interface FileSystem {
  [path: string]: FileSystemItem;
}
