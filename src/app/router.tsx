import { createBrowserRouter } from 'react-router-dom';
import { FrontpageRoute } from '@/routes/Frontpage/FrontpageRoute';
import { LoginRoute } from '@/routes/Login/LoginRoute';
import { WelcomeRoute } from '@/routes/Welcome/WelcomeRoute';
import { ProjectSetupRoute } from '@/routes/ProjectSetup/ProjectSetupRoute';
import { StoryboardWorkflowRoute } from '@/routes/StoryboardWorkflow/StoryboardWorkflowRoute';
import { MainShowcaseRoute } from '@/routes/MainShowcase/MainShowcaseRoute';
import { MotionGalleryRoute } from '@/routes/Motion/MotionGalleryRoute';
import { MotionPlayerRoute } from '@/routes/Motion/MotionPlayerRoute';
import { NotFoundRoute } from '@/routes/NotFound/NotFoundRoute';

/**
 * Central route table. The product flow is:
 *   /  →  /login  →  /welcome  →  /projects  →  /workflow
 * `/main` hosts the unified marketing/showcase page.
 * `/motion` is the internal Motion tab — advertising motion graphics that film
 * the real product (each piece at /motion/:pieceId).
 */
export const router = createBrowserRouter([
  { path: '/', element: <FrontpageRoute /> },
  { path: '/login', element: <LoginRoute /> },
  { path: '/welcome', element: <WelcomeRoute /> },
  { path: '/projects', element: <ProjectSetupRoute /> },
  { path: '/workflow', element: <StoryboardWorkflowRoute /> },
  { path: '/main', element: <MainShowcaseRoute /> },
  { path: '/motion', element: <MotionGalleryRoute /> },
  { path: '/motion/:pieceId', element: <MotionPlayerRoute /> },
  { path: '*', element: <NotFoundRoute /> },
]);
