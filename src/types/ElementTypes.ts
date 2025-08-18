/**
 * Type definitions for Visual HTML Builder elements
 * This file provides type-safe interfaces for all element properties and related utilities
 */

// Individual element property interfaces
export interface TitleProps {
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface TextProps {
  content: string;
}

export interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface ListProps {
  items: string[];
  ordered: boolean;
}

// Union type for all element properties
export type ElementProps = TitleProps | TextProps | ImageProps | ListProps;

// Property value types for form inputs
export type PropertyValue = string | number | boolean | string[];

// Generic type for element renderers
export interface ElementRenderer<T extends ElementProps> {
  name: string;
  icon: string;
  defaultProps: T;
  render: (props: T) => string;
  renderEditor: (props: T, onChange?: (key: keyof T, value: PropertyValue) => void) => string;
  validate: (props: T) => string | null;
}

// Drag and drop related types
export interface DragDropElement extends Element {
  dataset: DOMStringMap & {
    elementId?: string;
    index?: string;
  };
}

// Element type mapping for type safety
export interface ElementTypeMap {
  title: TitleProps;
  text: TextProps;
  image: ImageProps;
  list: ListProps;
}

// Helper type to get props type from element type string
export type PropsFromElementType<T extends keyof ElementTypeMap> = ElementTypeMap[T];

// Generic element type interface
export interface ElementType<T extends ElementProps = ElementProps> {
  name: string;
  icon: string;
  defaultProps: T;
  render: (props: T) => string;
  renderEditor: (props: T, onChange?: (key: string, value: PropertyValue) => void) => string;
  validate: (props: T) => string | null;
}