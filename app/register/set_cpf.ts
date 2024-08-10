const numerical = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
export default async function setCpf2(cpf: string, func: (arg0: string) => void) {
    const last = cpf[cpf.length - 1]
    if (!numerical.includes(last) || cpf.length > 14) {
      cpf = cpf.substring(0, cpf.length-1)
    }
    if (cpf.length === 4 || cpf.length === 8 || cpf.length === 12) {
      var diff = ['.']
      if (cpf.length === 12) {
        diff = ['-']
      }
      cpf = cpf.substring(0, cpf.length-1) + diff + [last]
    }
    func(cpf)
  }