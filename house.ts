interface Address {street:string, zip:string}
interface Person {name:string,properties:House[]}
interface House {address : Address, value: number, occupant: Person, owner:Person}
class House {
  constructor(public house:House){}
  isRented(){return this.house.owner.name !== this.house.occupant.name}
  OccupantChanged
}
type Predicate<T> = (value:T) => boolean



class Employee {
	constructor(public name: string, public salary: number) {}
  }
  
  class Department {
	constructor(public employees: Employee[]) {}
  
	works(employee: Employee): boolean {
	  return this.employees.indexOf(employee) > -1;
	}
  }
    
  function and<T>(predicates: Predicate<T>[]): Predicate<T> {
	return (value) => predicates.every(p => p(value));
  }
  
  function filteredSalaries(employees: Employee[], conditions: Predicate<Employee>[]): number[] {
	const filtered = employees.filter(and(conditions));
	return filtered.map(e => e.salary);
  }
  
  function average(nums: number[]): number {
	const total = nums.reduce((a,b) => a + b, 0);
	return total / nums.length;
  }
  
  function averageFilteredSalary(employees: Employee[], conditions: Predicate<Employee>[]): number {
	return average(filteredSalaries(employees, conditions));
  }
  
  const empls = [
	new Employee("Jim", 100),
	new Employee("John", 200),
	new Employee("Liz", 120),
	new Employee("Penny", 30)
  ];
  
  const sales = new Department([empls[0], empls[1]]);
  
  const conditions = [
	(employee) => employee.salary > 50, 
	(employee) => sales.works(employee)
  ];
  
  const salesAverageSalaryOver50 = averageFilteredSalary(empls, conditions);
  console.log('salesAverageSalaryOver50:', salesAverageSalaryOver50);