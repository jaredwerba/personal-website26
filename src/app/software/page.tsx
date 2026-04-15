"use client";

import { useState, useEffect } from "react";
import {
  Badge,
  Divider,
  TerminalDisplay,
  PilotCard,
  DataGrid,
  BarChart,
  Button,
} from "@mdrbx/nerv-ui";
import Section from "@/components/Section";
import { useIsMobile } from "@/hooks/useIsMobile";

interface GitHubRepo {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  html_url: string;
  updated_at: string;
  fork: boolean;
}

interface GitHubUser {
  login: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  avatar_url: string;
  html_url: string;
  created_at: string;
}

export default function SoftwarePage() {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);

  const GITHUB_USERNAME = "jaredwerba";
  const isMobile = useIsMobile();

  useEffect(() => {
    Promise.all([
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}`).then((r) => r.json()),
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=50`).then((r) => r.json()),
    ])
      .then(([userData, repoData]) => {
        setUser(userData);
        setRepos(Array.isArray(repoData) ? repoData.filter((r: GitHubRepo) => !r.fork) : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const langCounts: Record<string, number> = {};
  repos.forEach((r) => {
    if (r.language) langCounts[r.language] = (langCounts[r.language] || 0) + 1;
  });
  const langBars = Object.entries(langCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([label, value]) => ({ label, value }));

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

      {loading ? (
        <TerminalDisplay
          lines={[
            "> QUERYING GITHUB API...",
            `> TARGET: github.com/${GITHUB_USERNAME}`,
            "> FETCHING REPOSITORY DATA...",
          ]}
          typewriter
          color="green"
          title="FETCH.STATUS"
          maxHeight="120px"
        />
      ) : (
        <>
          {user && (
            <PilotCard
              designation="DEV.01"
              name={user.name || user.login}
              unit="GITHUB"
              imageUrl={user.avatar_url}
              color="orange"
              checkStatus="O.K."
              plugNumber={String(user.public_repos)}
              fields={[
                { label: "REPOS", value: String(user.public_repos), status: "ok" },
                { label: "FOLLOWERS", value: String(user.followers), status: "ok" },
                { label: "FOLLOWING", value: String(user.following), status: "ok" },
                { label: "MEMBER.SINCE", value: new Date(user.created_at).getFullYear().toString(), status: "ok" },
              ]}
            />
          )}

          <TerminalDisplay
            lines={[
              `> PROFILE.SCAN COMPLETE`,
              `> REPOSITORIES ..... ${repos.length}`,
              `> LANGUAGES ........ ${Object.keys(langCounts).length}`,
              `> TOTAL.STARS ....... ${repos.reduce((s, r) => s + r.stargazers_count, 0)}`,
              `> FOLLOWERS ........ ${user?.followers || 0}`,
              `> FOLLOWING ........ ${user?.following || 0}`,
              `> MEMBER.SINCE ..... ${user ? new Date(user.created_at).getFullYear() : "—"}`,
            ]}
            color="green"
            title="GITHUB.STATS"
            maxHeight="200px"
          />

          {langBars.length > 0 && (
            <Section label="LANGUAGE.ANALYSIS" color="green">
              <div className="p-4">
                <BarChart
                  bars={langBars}
                  color="green"
                  title="LANGUAGES"
                  direction="horizontal"
                  showValues
                  height={Math.max(180, langBars.length * 36)}
                  unit=" repos"
                />
              </div>
            </Section>
          )}

          <Section label="REPOSITORY.INDEX" color="orange">
            <div className="p-1 md:p-2">
              <DataGrid
                columns={isMobile
                  ? [
                      { key: "name", header: "NAME", width: "45%" },
                      { key: "language", header: "LANG", width: "20%", align: "center" as const },
                      { key: "stars", header: "STARS", width: "15%", align: "center" as const, sortable: true, type: "int" as const },
                      { key: "updated", header: "UPDATED", width: "20%", align: "center" as const },
                    ]
                  : [
                      { key: "name", header: "NAME", width: "35%" },
                      { key: "language", header: "LANG", width: "15%", align: "center" as const },
                      { key: "stars", header: "STARS", width: "10%", align: "center" as const, sortable: true, type: "int" as const },
                      { key: "updated", header: "UPDATED", width: "20%", align: "center" as const },
                      { key: "desc", header: "DESC", width: "20%" },
                    ]
                }
                data={repos.map((r) => ({
                  name: r.name,
                  language: r.language || "—",
                  stars: r.stargazers_count,
                  updated: new Date(r.updated_at).toLocaleDateString(),
                  desc: r.description || "—",
                }))}
                color="green"
                title="ALL.REPOS"
                showIndex
                pageSize={10}
                maxHeight="500px"
              />
            </div>
          </Section>

          <a href={user?.html_url || `https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noopener noreferrer">
            <Button variant="terminal" fullWidth>
              VIEW.FULL.GITHUB.PROFILE &rarr;
            </Button>
          </a>
        </>
      )}
    </div>
  );
}
