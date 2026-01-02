export interface Category {
  id: string;
  projectId: string;
  name: string;
  color: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryDto {
  name: string;
  color: string;
  parentId?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  color?: string;
  parentId?: string;
}

export interface CategoryWithSubcategories extends Category {
  subcategories?: Category[];
}
