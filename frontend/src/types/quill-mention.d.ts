// Type declarations for Quill mention module

declare module "@/lib/quill-mention/quill.mention" {
  import Quill from "quill"

  export interface MentionModuleOptions {
    source?: (
      searchTerm: string,
      renderList: (data: any[], searchTerm: string) => void,
      mentionChar: string
    ) => void
    renderItem?: (item: any, searchTerm: string) => string
    mentionDenotationChars?: string[]
    allowedChars?: RegExp
    minChars?: number
    maxChars?: number
    offsetTop?: number
    offsetLeft?: number
    isolateCharacter?: boolean
    fixMentionsToQuill?: boolean
    defaultMenuOrientation?: "top" | "bottom"
  }

  export default class Mention {
    constructor(quill: Quill, options: MentionModuleOptions)
  }
}

declare module "@/lib/quill-mention/blots/mention" {
  // Mention blot is registered globally with Quill
}

declare module "@/lib/quill-mention/constants/keys" {
  const Keys: {
    TAB: string
    ENTER: string
    ESCAPE: number
    UP: string
    DOWN: string
  }
  export default Keys
}
