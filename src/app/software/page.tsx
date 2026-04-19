"use client";

import { Badge, Divider, Button } from "@mdrbx/nerv-ui";

const GITHUB_URL = "https://github.com/jaredwerba";

export default function SoftwarePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="font-nerv-display text-2xl md:text-3xl tracking-[0.16em] text-nerv-orange">
          SOFTWARE
        </h2>
        <Badge label="GITHUB" variant="default" size="sm" />
      </div>

      <p className="font-nerv-mono text-xs text-nerv-mid-gray tracking-wider">
        // CODE.REPOSITORY
      </p>

      <Divider color="green" variant="dashed" />

      <a href={GITHUB_URL}>
        <Button variant="terminal" fullWidth>
          VIEW.GITHUB.PROFILE &rarr;
        </Button>
      </a>
    </div>
  );
}
