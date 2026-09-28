import DropdownMenu from '../components/DropdownMenu'

export default function HigherUncle() {
  const items = ['First', 'Second', 'Third']

  return (
    <>
      <div className='relative z-10'>
        <DropdownMenu items={items} triggerLabel='Hello' onItemSelect={console.log} />
      </div>
      <div className='relative z-20'>Hello there</div>
    </>
  );
}
