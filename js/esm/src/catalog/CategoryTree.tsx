// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Category and subcategory tree with checkboxes and subtree course counts.
 *
 * @module     theme_flexium/catalog/CategoryTree
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {useEffect, useMemo, useState} from 'react';
import OptionCheckbox from '@moodle/lms/theme_flexium/catalog/OptionCheckbox';
import type {BulkToggle, FilterOption, Strings} from './types';
import {normalise, str} from './utils';

interface CategoryTreeProps {
    options: FilterOption[];
    onToggle: (value: string) => void;
    strings: Strings;
    /** Last "Expand all" / "Collapse all" click of the sidebar. */
    bulk: BulkToggle | null;
    /** Show the number of courses of each option. */
    showcount: boolean;
    /** Text typed in the group search box: matching categories are listed flat. */
    filter: string;
}

interface TreeNode {
    option: FilterOption;
    children: TreeNode[];
}

/**
 * Build the tree from the flat option list (each option knows its parent value).
 *
 * @param options
 */
const buildTree = (options: FilterOption[]): TreeNode[] => {
    const nodes = new Map<string, TreeNode>();
    options.forEach(option => nodes.set(option.value, {option, children: []}));
    const roots: TreeNode[] = [];
    nodes.forEach(node => {
        const parent = node.option.parent ? nodes.get(node.option.parent) : undefined;
        (parent ? parent.children : roots).push(node);
    });
    return roots;
};

/**
 * Whether a node or one of its descendants is selected.
 *
 * @param node
 */
const hasSelection = (node: TreeNode): boolean =>
    node.option.selected || node.children.some(hasSelection);

export default function CategoryTree({options, onToggle, strings, bulk, showcount, filter}: CategoryTreeProps) {
    const roots = useMemo(() => buildTree(options), [options]);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    // "Expand all" / "Collapse all" opens or closes every branch.
    useEffect(() => {
        if (bulk) {
            const all: Record<string, boolean> = {};
            options.forEach(option => {
                if (option.parent) {
                    all[option.parent] = bulk.open;
                }
            });
            setExpanded(all);
        }
    }, [bulk]);

    const renderNodes = (nodes: TreeNode[], level: number) => (
        <ul className={level === 0 ? 'flexium-tree' : 'flexium-tree__children'}>
            {nodes.map(node => {
                const value = node.option.value;
                const hasChildren = node.children.length > 0;
                // Branches holding a selection start open, so the selection is visible.
                const isOpen = expanded[value] ?? node.children.some(hasSelection);
                return (
                    <li key={value} className="flexium-tree__item">
                        <div className="flexium-tree__row">
                            {hasChildren ? (
                                <button
                                    type="button"
                                    className="flexium-tree__toggle"
                                    aria-expanded={isOpen}
                                    aria-label={str(strings, isOpen ? 'catalog_collapse' : 'catalog_expand', node.option.label)}
                                    onClick={() => setExpanded({...expanded, [value]: !isOpen})}
                                >
                                    <i className={`fa fa-${isOpen ? 'minus' : 'plus'}`} aria-hidden="true"></i>
                                </button>
                            ) : (
                                <span className="flexium-tree__spacer" aria-hidden="true"></span>
                            )}
                            <OptionCheckbox option={node.option} onToggle={onToggle} showcount={showcount} />
                        </div>
                        {hasChildren && isOpen && renderNodes(node.children, level + 1)}
                    </li>
                );
            })}
        </ul>
    );

    const needle = normalise(filter.trim());
    if (needle) {
        // Searching: the matching categories, flat, so a deep one is found without opening its branch.
        const matches = options.filter(option => normalise(option.label).includes(needle));
        return (
            <ul className="flexium-optionlist">
                {matches.map(option => (
                    <li key={option.value}><OptionCheckbox option={option} onToggle={onToggle} showcount={showcount} /></li>
                ))}
            </ul>
        );
    }

    return roots.length ? renderNodes(roots, 0) : null;
}
