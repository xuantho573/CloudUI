import { ActionMenu, ActionList } from '@primer/react'

type Props<T extends string | number | boolean> = {
  items: T[];
  onItemSelect: (item: T) => void;
  triggerLabel: string;
}

export default function DropdownMenu<T extends string | number | boolean>({
  items,
  onItemSelect,
  triggerLabel,
}: Props<T>) {
  return (
    <ActionMenu>
      <ActionMenu.Button>{triggerLabel}</ActionMenu.Button>
      <ActionMenu.Overlay>
        <ActionList>
          {items.map((item) => <ActionList.Item onSelect={() => onItemSelect(item)}>{item.toString()}</ActionList.Item>)}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  );
}
