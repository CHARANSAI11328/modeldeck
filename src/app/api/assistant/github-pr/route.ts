import { NextRequest, NextResponse } from "next/server";
import { GitHubPrRequestPayload, GitHubPrResponse } from "@/lib/assistantTypes";

export const runtime = "nodejs";

// Extract owner and repo from various URL formats
function parseGitHubRepo(repoInput: string): { owner: string; repo: string } | null {
  const trimmed = repoInput.trim().replace(/\/+$/, "");
  // Formats:
  // https://github.com/owner/repo
  // https://github.com/owner/repo.git
  // git@github.com:owner/repo.git
  // owner/repo
  const httpsMatch = trimmed.match(/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+?)(?:\.git)?$/i);
  if (httpsMatch) {
    return { owner: httpsMatch[1], repo: httpsMatch[2] };
  }

  const sshMatch = trimmed.match(/github\.com:([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+?)(?:\.git)?$/i);
  if (sshMatch) {
    return { owner: sshMatch[1], repo: sshMatch[2] };
  }

  const slugMatch = trimmed.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
  if (slugMatch) {
    return { owner: slugMatch[1], repo: slugMatch[2] };
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body: GitHubPrRequestPayload = await req.json();
    const { githubToken, repoUrl, scriptSnippet, assistantConfig } = body;

    if (!githubToken || !githubToken.trim()) {
      return NextResponse.json(
        { success: false, error: "GitHub Personal Access Token is required." },
        { status: 400 }
      );
    }

    if (!repoUrl || !repoUrl.trim()) {
      return NextResponse.json(
        { success: false, error: "GitHub Repository URL or 'owner/repo' is required." },
        { status: 400 }
      );
    }

    const parsed = parseGitHubRepo(repoUrl);
    if (!parsed) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid GitHub repository format. Expected 'owner/repo' or 'https://github.com/owner/repo'",
        },
        { status: 400 }
      );
    }

    const { owner, repo } = parsed;
    const authHeaders = {
      Authorization: `Bearer ${githubToken.trim()}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "ModelDeck-Assistant-Studio",
    };

    // 1. Fetch Repository Details to verify access and get default branch
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: authHeaders,
    });

    if (!repoRes.ok) {
      const errData = await repoRes.json().catch(() => ({}));
      if (repoRes.status === 404) {
        return NextResponse.json(
          {
            success: false,
            error: `Repository '${owner}/${repo}' not found. Make sure it exists and your token has 'repo' permissions.`,
          },
          { status: 404 }
        );
      }
      if (repoRes.status === 401) {
        return NextResponse.json(
          { success: false, error: "Invalid GitHub Token. Please check your credentials." },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { success: false, error: errData.message || "Failed to access GitHub repository." },
        { status: repoRes.status }
      );
    }

    const repoData = await repoRes.json();
    const defaultBranch = repoData.default_branch || "main";

    // 2. Get latest commit SHA on the default branch
    const branchRefRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${defaultBranch}`,
      { headers: authHeaders }
    );

    if (!branchRefRes.ok) {
      return NextResponse.json(
        { success: false, error: `Could not find branch '${defaultBranch}' in repository.` },
        { status: 400 }
      );
    }

    const branchRefData = await branchRefRes.json();
    const latestCommitSha = branchRefData.object.sha;

    // 3. Inspect repository tree to locate best entrypoint file
    const treeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${latestCommitSha}?recursive=1`,
      { headers: authHeaders }
    );

    let targetFilePath = "index.html";
    if (treeRes.ok) {
      const treeData = await treeRes.json();
      const files: string[] = (treeData.tree || [])
        .filter((node: any) => node.type === "blob")
        .map((node: any) => node.path);

      const candidates = [
        "index.html",
        "public/index.html",
        "src/index.html",
        "app/layout.tsx",
        "src/app/layout.tsx",
        "app/layout.jsx",
        "src/app/layout.jsx",
        "app/layout.js",
        "src/app/layout.js",
        "src/layouts/Layout.astro",
        "src/layouts/BaseLayout.astro",
        "src/routes/+layout.svelte",
        "pages/_document.tsx",
        "src/pages/_document.tsx",
        "pages/_document.js",
        "src/pages/_document.js",
        "index.htm",
      ];

      for (const candidate of candidates) {
        if (files.includes(candidate)) {
          targetFilePath = candidate;
          break;
        }
      }
    }

    // 4. Fetch the target file content
    const fileRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${targetFilePath}?ref=${defaultBranch}`,
      { headers: authHeaders }
    );

    let originalContent = "";
    let fileSha: string | undefined;

    if (fileRes.ok) {
      const fileData = await fileRes.json();
      fileSha = fileData.sha;
      originalContent = Buffer.from(fileData.content, "base64").toString("utf-8");
    } else {
      // If no file exists at all, we will create a clean index.html
      targetFilePath = "index.html";
      originalContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${assistantConfig?.title || "My Portfolio"}</title>
</head>
<body>
  <h1>Welcome to my website</h1>
</body>
</html>`;
    }

    // 5. Inject the embed snippet
    if (originalContent.includes("embed.js") && originalContent.includes("data-assistant-id")) {
      return NextResponse.json({
        success: false,
        error: `ModelDeck Assistant script is already present in '${targetFilePath}'!`,
      });
    }

    let modifiedContent = originalContent;
    const cleanSnippet = scriptSnippet.trim();
    const isJsxOrTsx = /\.[jt]sx?$/i.test(targetFilePath);
    const commentLine = isJsxOrTsx
      ? "{/* ModelDeck Personalized AI Assistant */}"
      : "<!-- ModelDeck Personalized AI Assistant -->";

    if (modifiedContent.includes("</body>")) {
      modifiedContent = modifiedContent.replace(
        "</body>",
        `  ${commentLine}\n  ${cleanSnippet}\n</body>`
      );
    } else if (modifiedContent.includes("</html>")) {
      modifiedContent = modifiedContent.replace(
        "</html>",
        `  ${commentLine}\n  ${cleanSnippet}\n</html>`
      );
    } else {
      modifiedContent += `\n\n${commentLine}\n${cleanSnippet}\n`;
    }

    // 6. Create a new branch for the Pull Request
    const branchName = `feat/modeldeck-assistant-${Date.now().toString(36)}`;
    const createBranchRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/refs`,
      {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          ref: `refs/heads/${branchName}`,
          sha: latestCommitSha,
        }),
      }
    );

    if (!createBranchRes.ok) {
      const err = await createBranchRes.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, error: err.message || "Failed to create new branch on GitHub." },
        { status: createBranchRes.status }
      );
    }

    // 7. Commit the modified file to the new branch
    const commitPayload: any = {
      message: `feat(ai): integrate ModelDeck personalized AI assistant widget into ${targetFilePath}`,
      content: Buffer.from(modifiedContent, "utf-8").toString("base64"),
      branch: branchName,
    };
    if (fileSha) {
      commitPayload.sha = fileSha;
    }

    const commitRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${targetFilePath}`,
      {
        method: "PUT",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify(commitPayload),
      }
    );

    if (!commitRes.ok) {
      const err = await commitRes.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, error: err.message || "Failed to commit changes to the branch." },
        { status: commitRes.status }
      );
    }

    // 8. Open the Pull Request
    const prTitle = `🤖 Add ModelDeck Personalized AI Assistant to ${repo}`;
    const prBody = `## 🤖 ModelDeck Personalized AI Assistant Integration

Hello! This pull request integrates a live, personalized AI Assistant widget into your website.

### ✨ What was added:
- Integrated zero-dependency floating chat widget in \`${targetFilePath}\`.
- Tailored persona and knowledge base for **${assistantConfig?.name || "Portfolio Assistant"}**.
- Suggested prompt chips and markdown rendering with 1-click code copying.

### 📋 Embed Code Added:
\`\`\`html
${cleanSnippet}
\`\`\`

### 🚀 Next Steps:
1. Merge this Pull Request.
2. Visit your deployed site to see your new AI Assistant floating in the corner!
3. Customize persona, greeting, or colors anytime from your ModelDeck Studio.

*Generated automatically with ⚡ [ModelDeck](https://github.com)*`;

    const prRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        title: prTitle,
        head: branchName,
        base: defaultBranch,
        body: prBody,
      }),
    });

    if (!prRes.ok) {
      const err = await prRes.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, error: err.message || "Failed to create GitHub Pull Request." },
        { status: prRes.status }
      );
    }

    const prData = await prRes.json();
    const responsePayload: GitHubPrResponse = {
      success: true,
      prUrl: prData.html_url,
      branch: branchName,
      fileUpdated: targetFilePath,
    };

    return NextResponse.json(responsePayload);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "GitHub PR integration failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
