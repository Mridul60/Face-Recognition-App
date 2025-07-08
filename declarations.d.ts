declare module '*.png'
{
    const content: number;
    export default content;
}
// declarations.d.ts
declare module '*.svg' {
    import * as React from 'react';
    const content: React.FC<React.SVGProps<SVGSVGElement>>;
    export default content;
  }
  