// オブジェクト丸ごとをオプショナルにする型関数
// Partialとは異なり、要素の内どれか1つでも持っていることがわかれば、他の要素もnon-nullableになる
export type OptionalBlock<O extends object, K extends keyof O = keyof O> =
  | O
  | { [P in keyof O]: P extends K ? O[P] : undefined }
  | { [P in keyof O]: undefined }
