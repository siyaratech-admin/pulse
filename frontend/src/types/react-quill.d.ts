// Type declarations for react-quill

declare module "react-quill" {
  import { Component } from "react"
  import Quill from "quill"

  export interface ReactQuillProps {
    value?: string
    defaultValue?: string
    placeholder?: string
    readOnly?: boolean
    theme?: string
    modules?: any
    formats?: string[]
    bounds?: string | HTMLElement
    onChange?: (
      content: string,
      delta: any,
      source: string,
      editor: any
    ) => void
    onChangeSelection?: (
      selection: any,
      source: string,
      editor: any
    ) => void
    onFocus?: (selection: any, source: string, editor: any) => void
    onBlur?: (
      previousSelection: any,
      source: string,
      editor: any
    ) => void
    onKeyPress?: (event: React.KeyboardEvent) => void
    onKeyDown?: (event: React.KeyboardEvent) => void
    onKeyUp?: (event: React.KeyboardEvent) => void
    tabIndex?: number
    className?: string
    style?: React.CSSProperties
    preserveWhitespace?: boolean
    children?: React.ReactElement
  }

  export default class ReactQuill extends Component<ReactQuillProps> {
    editor: Quill
    getEditor(): Quill
    focus(): void
    blur(): void
  }

  export const Quill: typeof Quill
}
