import os
import argparse
from pathlib import Path
import pathspec

# --- Constants for styling the output ---
HEADER_LINE = "*" * 100
FILE_SEPARATOR = "\n\n"

DEFAULT_IGNORE_PATTERNS = [
    ".git/",
    ".venv/",
    "venv/",
    "__pycache__/",
    "*.pyc",
    ".env",
    ".env.*",
    "uv.lock",
    "poetry.lock",
    "Pipfile.lock",
    "package-lock.json",
    "yarn.lock",
    ".gitignore",
    "LICENSE",
    "license",
    ".vscode/",
    ".idea/",
    "node_modules/",
]


def get_gitignore_spec(directory: Path, output_filename: str) -> pathspec.PathSpec:
    """Combines default patterns and .gitignore patterns."""
    gitignore_file = directory / ".gitignore"
    project_patterns = []
    if gitignore_file.is_file():
        with open(gitignore_file, "r", encoding="utf-8") as f:
            project_patterns = f.readlines()

    all_patterns = (
        DEFAULT_IGNORE_PATTERNS + [output_filename] + project_patterns
    )
    return pathspec.PathSpec.from_lines("gitwildmatch", all_patterns)


def process_directory(source_dir: Path, target_file_path: Path, spec: pathspec.PathSpec):
    """Walks the source, filters by spec, and writes to the target path."""
    files_processed = 0

    print(f"\nScanning: {source_dir}")
    print(f"Saving to: {target_file_path}")

    # Ensure the parent directory of the output file exists
    target_file_path.parent.mkdir(parents=True, exist_ok=True)

    with open(target_file_path, "w", encoding="utf-8") as outfile:
        for dirpath, dirnames, filenames in os.walk(source_dir, topdown=True):
            current_path = Path(dirpath)

            # Filter directories
            excluded_dirs = []
            for d in dirnames:
                full_dir_path = current_path / d
                relative_dir_path_str = str(
                    full_dir_path.relative_to(source_dir)
                ).replace("\\", "/")
                if spec.match_file(relative_dir_path_str + "/"):
                    excluded_dirs.append(d)

            dirnames[:] = [d for d in dirnames if d not in excluded_dirs]

            # Filter and process files
            for filename in filenames:
                full_file_path = current_path / filename
                relative_file_path = full_file_path.relative_to(source_dir)
                relative_file_path_str = str(relative_file_path).replace("\\", "/")

                # Skip the output file itself if it's inside the source directory
                if target_file_path.resolve() == full_file_path.resolve():
                    continue

                if not spec.match_file(relative_file_path_str):
                    try:
                        with open(full_file_path, "r", encoding="utf-8") as infile:
                            content = infile.read()

                        outfile.write(f"{HEADER_LINE}\n")
                        outfile.write(f"File: {relative_file_path_str}\n")
                        outfile.write(f"{HEADER_LINE}\n\n")
                        outfile.write(content)
                        outfile.write(FILE_SEPARATOR)

                        print(f"  [+] Added: {relative_file_path_str}")
                        files_processed += 1

                    except (UnicodeDecodeError, PermissionError):
                        continue
                    except Exception as e:
                        print(f"  [!] Error reading {relative_file_path_str}: {e}")

    print(f"\nSuccess! Total files added: {files_processed}")


def main():
    print("--- Codebase to Text Converter ---")
    
    # 1. Input: Source Directory
    src_input = input("Enter the directory path to scan (default is current '.'): ").strip()
    if not src_input:
        src_input = "."
    source_dir = Path(src_input).resolve()

    if not source_dir.is_dir():
        print(f"Error: The directory '{source_dir}' does not exist.")
        return

    # 2. Input: Save Directory
    save_input = input("Enter the directory where you want to save the output (default is '.'): ").strip()
    if not save_input:
        save_input = "."
    save_dir = Path(save_input).resolve()

    # 3. Input: Filename
    filename = input("Enter the output filename (default: codebase_content.txt): ").strip()
    if not filename:
        filename = "codebase_content.txt"

    target_file_path = save_dir / filename

    # Run processing
    spec = get_gitignore_spec(source_dir, filename)
    process_directory(source_dir, target_file_path, spec)


if __name__ == "__main__":
    main()