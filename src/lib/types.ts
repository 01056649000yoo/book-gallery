export interface Class {
  id: string
  name: string
  description: string | null
  created_at: string
}

export interface Book {
  id: string
  class_id: string
  title: string
  author: string
  description: string | null
  cover_image_path: string
  pdf_path: string
  created_at: string
}

export interface QRToken {
  id: string
  class_id: string
  expires_at: string
  is_active: boolean
  created_at: string
}
