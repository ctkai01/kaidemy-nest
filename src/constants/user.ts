// For role state
export const SUPPER_ADMIN = 0
export const ADMIN = 1
export const NORMAL_USER = 2
export const TEACHER = 3
export const DEFAULT_ROLE = NORMAL_USER;

// For stripe state
export const ACCOUNT_STRIPE_PENDING = 1
export const ACCOUNT_STRIPE_VERIFY = 2;

// For type account
export const ACCOUNT_NORMAL = 1
export const ACCOUNT_GOOGLE = 2

export interface AuthorLearning {
    id: number,
    name: string
}

export interface UserReport {
    id: number,
    name: string,
    avatar?: string,
} 