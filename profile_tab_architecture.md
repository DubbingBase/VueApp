# Profile Tab Architecture Design

## Overview
The Profile tab will be a new feature accessible only to authenticated users who have a linked voice actor account. It provides voice actors with the ability to manage their profile information and work entries.

## 1. User-Voice Actor Linking Mechanism

### Option Analysis
- **User Metadata Approach**: Add `voice_actor_id` to Supabase auth user metadata
- **Database Table Approach**: Create `user_voice_actors` table linking auth users to voice actors

### Recommended Solution: User Metadata
- **Pros**: Simple, leverages existing auth system, no additional database tables
- **Cons**: Limited to one voice actor per user (acceptable for MVP)
- **Implementation**: Store `voice_actor_id` in `user_metadata` during account linking process

### Database Schema Changes
No new tables required. Update user metadata structure:

```typescript
interface User {
  id: string;
  email?: string;
  app_metadata?: {
    role?: string;
  };
  user_metadata?: {
    name?: string;
    avatar_url?: string;
    voice_actor_id?: number; // New field
  };
}
```

## 2. UI Structure Design

### Tab Integration
- Add conditional "Profile" tab in `src/layouts/base.vue` when `user.user_metadata.voice_actor_id` exists
- Use SolarUserLinear icon for consistency

### Profile View (`src/views/profile.vue`)
Main container with two primary sections:

#### Profile Editing Section
- **Profile Picture**: Upload/edit functionality (reuse existing `upload_profile_picture` function)
- **Basic Info**: Editable fields for name, bio, nationality, etc.
- **Personal Details**: Date of birth, years active, awards, social media links

#### Work Management Section
- **Work List**: Display current work entries with edit/delete actions
- **Add Work**: Modal/form for adding new work entries
- **Edit Work**: Inline editing for existing entries

### Component Hierarchy
Following single-responsibility principle:

```
ProfileView (main container)
├── ProfileHeader
│   ├── ProfilePictureEditor
│   └── ProfileBasicInfo
├── ProfileDetailsEditor
├── WorkManagement
│   ├── WorkList
│   │   └── WorkItem (with edit/delete actions)
│   ├── AddWorkModal
│   └── EditWorkModal
└── LoadingState/ErrorState
```

Each component handles one concern:
- `ProfilePictureEditor`: Image upload and cropping
- `ProfileBasicInfo`: Name display and basic info editing
- `ProfileDetailsEditor`: Form for detailed profile information
- `WorkList`: List display and sorting
- `WorkItem`: Individual work entry with actions
- `AddWorkModal/EditWorkModal`: Forms for work management

## 3. Data Flow Architecture

### State Management
- Use Pinia store: `src/stores/profile.ts`
- Store voice actor data, work entries, loading states, errors
- Actions for fetch, update, add/remove work

### Data Fetching Flow
1. On profile tab load, check `authStore.currentUser.user_metadata.voice_actor_id`
2. If exists, fetch voice actor data using existing `voice-actor` function
3. Store in profile store for reactive updates

### Update Flow
1. User edits profile → call update function → optimistic UI update
2. API call to update voice actor data
3. On success: update store, show success toast
4. On error: revert changes, show error message

### Work Management Flow
1. Add work: Open modal → select actor/content → submit → API call → refresh list
2. Edit work: Inline edit → save → API call → update list item
3. Delete work: Confirm dialog → API call → remove from list

## 4. API Interactions

### Existing Functions (Reuse)
- `voice-actor`: Fetch voice actor data and work entries
- `upload_profile_picture`: Handle profile image uploads
- `link-voice-actor`: Create work entries
- `delete-voice-actor-link`: Remove work entries

### New Functions Required

#### `update-voice-actor` (`supabase/functions/update-voice-actor/index.ts`)
- **Purpose**: Update voice actor profile information
- **Input**: `voice_actor_id`, `updates` object (firstname, lastname, bio, etc.)
- **Validation**: Ensure user owns the voice actor (via metadata check)
- **Output**: Updated voice actor data

#### `get-user-voice-actor` (`supabase/functions/get-user-voice-actor/index.ts`)
- **Purpose**: Get voice actor data for authenticated user
- **Input**: None (uses auth context)
- **Logic**: Extract `voice_actor_id` from user metadata, fetch voice actor data
- **Output**: Voice actor data or null if not linked

#### `link-user-voice-actor` (`supabase/functions/link-user-voice-actor/index.ts`)
- **Purpose**: Link user account to voice actor (admin function)
- **Input**: `user_id`, `voice_actor_id`
- **Validation**: Admin only, voice actor exists
- **Output**: Success confirmation

### Function Signatures

```typescript
// update-voice-actor
interface UpdateVoiceActorRequest {
  voice_actor_id: number;
  updates: Partial<{
    firstname: string;
    lastname: string;
    bio: string;
    nationality: string;
    date_of_birth: string;
    awards: string;
    years_active: string;
    social_media_links: Json;
  }>;
}

// get-user-voice-actor
interface UserVoiceActorResponse {
  voiceActor: VoiceActor | null;
  medias: (Movie | Serie)[];
}

// link-user-voice-actor
interface LinkUserVoiceActorRequest {
  user_id: string;
  voice_actor_id: number;
}
```

## 5. Component Architecture Compliance

### Single Responsibility Principle
- Each component has one clear purpose
- Components are small (< 300 lines)
- Shared logic extracted to composables:
  - `useProfileEditing.ts`: Form handling and validation
  - `useWorkManagement.ts`: Work CRUD operations
  - `useImageUpload.ts`: File upload logic

### Reusable Components
- `EditableField`: Generic inline editing component
- `ConfirmDialog`: Reusable confirmation modal
- `LoadingSpinner`: Consistent loading states
- `ErrorMessage`: Standardized error display

### Component Communication
- Parent-child: Props and emit events
- Sibling: Shared store state
- Global: Auth store for user context

## 6. Security Considerations

### Authorization
- Profile tab only visible if `voice_actor_id` in user metadata
- API functions validate user owns voice actor before updates
- Admin-only functions for linking accounts

### Data Validation
- Client-side: Form validation with error messages
- Server-side: Input sanitization and type checking
- File uploads: Size limits, type restrictions

## 7. Error Handling

### User Experience
- Loading states for all async operations
- Error toasts for failed operations
- Retry mechanisms for network failures
- Offline support consideration

### Error Types
- Network errors: Retry with exponential backoff
- Validation errors: Show field-specific messages
- Authorization errors: Redirect or hide features
- Server errors: Generic error message with support contact

## 8. Performance Optimizations

### Data Loading
- Lazy load work entries with pagination
- Cache voice actor data in store
- Optimistic updates for better UX

### Image Handling
- Progressive loading for profile pictures
- Compression and resizing on upload
- CDN integration for fast delivery

## 9. Testing Strategy

### Unit Tests
- Component logic and interactions
- Store actions and getters
- Utility functions and composables

### Integration Tests
- API function calls
- Form submissions
- Navigation flows

### E2E Tests
- Complete user workflows
- Error scenarios
- Mobile responsiveness

## 10. Implementation Roadmap

### Phase 1: Core Infrastructure
- Add profile tab conditionally
- Create profile store and basic view
- Implement get-user-voice-actor function

### Phase 2: Profile Editing
- Profile picture upload
- Basic info editing form
- Update API function

### Phase 3: Work Management
- Work list display
- Add/edit/delete work functionality
- Integrate existing work functions

### Phase 4: Polish and Testing
- Error handling and loading states
- Mobile optimization
- Comprehensive testing

This architecture ensures maintainable, scalable code following the project's guidelines while providing a comprehensive profile management experience for voice actors.
