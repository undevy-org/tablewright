/**
 * The page the render check measures.
 *
 * Everything here imports from dist/es — the built artifact a consumer installs,
 * not src — and nothing imports src/styles.css, so Tailwind's global preflight
 * is absent exactly as it is for a consumer. The four portalled primitives are
 * force-opened through their controlled `open` prop and deliberately get NO
 * PortalContainerContext, so their content mounts on document.body: the case
 * where the scope has to travel on the content element itself.
 *
 * Each probed node carries data-probe. Assertions run in the page and write
 * their result into #result, which the runner reads out of the dumped DOM.
 */

import { createRoot } from "react-dom/client";
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  STYLE_SCOPE,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "../../dist/es/index.js";

function Fixture() {
  return (
    <>
      <div className={STYLE_SCOPE} data-theme="light" data-probe="scope-root">
        <Input data-probe="input" placeholder="probe" />
        <Button data-probe="button-default">default</Button>
        <Button variant="secondary" data-probe="button-secondary">
          secondary
        </Button>
        <Checkbox data-probe="checkbox" />
        <div className="scrollbar-auto-hide" data-probe="scrollbar" style={{ height: 20 }} />
        <table data-probe="table">
          <tbody>
            <tr>
              <td className="border-b border-[var(--border-subtle)]" data-probe="cell">
                cell
              </td>
            </tr>
          </tbody>
        </table>

        <DropdownMenu open>
          <DropdownMenuTrigger asChild>
            <Button>menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent data-probe="dropdown-content">
            <DropdownMenuItem>item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Popover open>
          <PopoverTrigger asChild>
            <Button>popover</Button>
          </PopoverTrigger>
          <PopoverContent data-probe="popover-content">body</PopoverContent>
        </Popover>

        <Select open>
          <SelectTrigger data-probe="select-trigger">trigger</SelectTrigger>
          <SelectContent data-probe="select-content">
            <SelectItem value="a">a</SelectItem>
          </SelectContent>
        </Select>

        <Dialog open>
          <DialogTrigger asChild>
            <Button>dialog</Button>
          </DialogTrigger>
          <DialogContent data-probe="dialog-content">body</DialogContent>
        </Dialog>
      </div>

      {/* Host territory: the package must not reach any of this. */}
      <div data-probe="host-area">
        <input data-probe="host-input" />
        <ul data-probe="host-list">
          <li>host item</li>
        </ul>
        <p data-probe="host-paragraph">host paragraph</p>
      </div>
    </>
  );
}

createRoot(document.getElementById("root")!).render(<Fixture />);

declare global {
  interface Window {
    __renderCheck?: unknown;
  }
}

type Check = { name: string; got: string; want: string; ok: boolean };

function assert(checks: Check[], name: string, got: string, want: string) {
  checks.push({ name, got, want, ok: got === want });
}

// Radix positions portalled content in an effect and Dialog animates in, so let
// the browser settle before reading. The runner gives Chrome a virtual-time
// budget well past this.
setTimeout(() => {
  const cs = (selector: string) => {
    const node = document.querySelector(`[data-probe="${selector}"]`);
    return node ? getComputedStyle(node) : null;
  };
  const checks: Check[] = [];
  const missing: string[] = [];
  const need = (selector: string) => {
    const style = cs(selector);
    if (!style) missing.push(selector);
    return style;
  };

  // 1. The reset must beat the host's bare-element rules.
  for (const probe of ["input", "button-secondary", "checkbox"]) {
    const style = need(probe);
    if (style) assert(checks, `${probe}: border-style`, style.borderTopStyle, "solid");
  }
  const input = need("input");
  if (input) assert(checks, "input: border-width", input.borderTopWidth, "1px");

  // 2. A utility must still beat the reset. The reset sets buttons to
  //    transparent; the default Button's own utility sets the accent fill.
  const primary = need("button-default");
  if (primary) assert(checks, "button-default: background", primary.backgroundColor, "rgb(17, 24, 39)");

  // 3. Typographic base wins over the host's body rules.
  const root = need("scope-root");
  if (root) {
    assert(checks, "scope: font-size", root.fontSize, "13px");
    assert(checks, "scope: line-height", root.lineHeight, "19.5px");
    assert(checks, "scope: font-family", root.fontFamily.split(",")[0].replace(/"/g, ""), "Inter");
  }

  // 4. Component-global classes ship and apply.
  const scrollbar = need("scrollbar");
  if (scrollbar) assert(checks, "scrollbar-auto-hide: scrollbar-width", scrollbar.scrollbarWidth, "thin");

  // 5. Border utilities inside a table resolve to a visible border.
  const cell = need("cell");
  if (cell) assert(checks, "cell: border-bottom", `${cell.borderBottomStyle} ${cell.borderBottomWidth}`, "solid 1px");

  // 6. Portalled content: mounted on body, still scoped.
  for (const probe of ["dropdown-content", "popover-content", "select-content"]) {
    const style = need(probe);
    if (style) {
      assert(checks, `${probe}: border-style`, style.borderTopStyle, "solid");
      assert(checks, `${probe}: font-size`, style.fontSize, "13px");
    }
    const node = document.querySelector(`[data-probe="${probe}"]`);
    if (node) {
      const scoped = node.closest(`.${STYLE_SCOPE}`) !== null;
      assert(checks, `${probe}: carries scope`, String(scoped), "true");
      const inWrapper = document.querySelector('[data-probe="scope-root"]')!.contains(node);
      assert(checks, `${probe}: outside the wrapper (portal)`, String(!inWrapper), "true");
    }
  }
  const dialog = need("dialog-content");
  if (dialog) {
    assert(checks, "dialog-content: font-size", dialog.fontSize, "13px");
    assert(checks, "dialog-content: carries scope", String(
      document.querySelector('[data-probe="dialog-content"]')!.closest(`.${STYLE_SCOPE}`) !== null,
    ), "true");
  }

  // 7. The host keeps its own rules — no leak in the other direction.
  const hostInput = need("host-input");
  if (hostInput) assert(checks, "host input: border stays none", hostInput.borderTopStyle, "none");
  const hostList = need("host-list");
  if (hostList) assert(checks, "host list: keeps list-style", hostList.listStyleType, "square");
  const hostParagraph = need("host-paragraph");
  if (hostParagraph) assert(checks, "host paragraph: keeps margin", hostParagraph.marginTop, "17px");

  const payload = { checks, missing };
  document.getElementById("result")!.textContent = JSON.stringify(payload);
}, 300);
